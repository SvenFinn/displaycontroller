# dc-ranges-multicast: Multicast interface

This interface is used by the display controller to read the ShootMaster systems’ multicast protocol and derive the current state of a shooting range from it. It provides structured information about disciplines, shooters, and start lists.

The extraction of range state information is based on heuristic, text-based analysis of the multicast packet content rather than a structured protocol implementation. This approach prioritizes long-term compatibility and robustness across ShootMaster versions.

This approach results in a number of limitations and edge cases, which are described in the [Known Limitations](#known-limitations) section below. In practice, these limitations do not affect typical real-world installations, but they should be considered when integrating or extending this interface.

To support this, the **dc-ranges-multicast-proxy** is used. This component performs a basic pre-filtering of multicast packets and forwards the relevant traffic into the display controller’s internal network.

---

## Design Goals and Rationale

Since the multicast protocol used by the ShootMaster system is undocumented and may change between system versions, fully reverse engineering it would be complex, fragile, and difficult to maintain.
In addition, the display controller can obtain most additional information through other interfaces provided by the ShootMaster server.

The multicast interface is designed to be lightweight and focused on extracting necessary information until the shooter takes the first shot and scoring data becomes available. After that point, the display controller can rely on more structured and authoritative interfaces to obtain detailed information about the range state.

Therefore, the multicast interface is not intended to provide a complete or fully verified representation of the range state. Instead, it serves as an interface for detecting if a range is active, and if so, which discipline, start list, and shooter are currently present at the range. This information is sufficient for the display controller to display basic information about the range, which gets enriched with more detailed information from other interfaces once the shooter starts shooting.

This allows for a more robust and maintainable implementation that is less likely to break due to protocol changes.
For this reason, the multicast interface is designed with the following goals:

- Avoid full protocol reverse engineering.
- Extract only the required information.  
  Data that is available through other interfaces should not be processed here.
- Remain robust against protocol changes.  
  The interface should support a wide range of ShootMaster versions and tolerate partially corrupt or unexpected data.
- Avoid false positives.  
  The interface should not report incorrect information about the range state, even if this means that some information cannot be extracted in certain edge cases.

## ShootMaster Multicast Protocol

For its internal communication, the ShootMaster system uses a proprietary multicast protocol. The protocol appears to use a custom binary serialization format and is not human-readable. In addition, there is no official documentation available, which makes custom implementations complicated.

The protocol is used, among other purposes, by the ShootMaster server to send control commands to each range. These commands include tasks such as assigning shooters, changing disciplines, etc. Most server-to-range communication is performed using this protocol. Multicast is used for broadcast messages affecting multiple ranges, while unicast is used when a command targets a specific range.

As part of this protocol, each shooting range periodically broadcasts its current state via the multicast address **224.0.0.1** on port **49497**. This broadcast is used by other systems, such as the official ShootMaster display controller, to visualize the range state. Because the ranges broadcast their state independently, the visualization can operate without a central ShootMaster server, which may not be present in smaller installations.

Within the ShootMaster ecosystem, a network can contain up to **416 ranges**. Each range is identified by a unique “range number” in the range from **1 to 416**. This identifier is used consistently across the entire ShootMaster system, including in the range broadcast.

## Packet Processing

### Message Model

Without a formal protocol definition, the broadcast sent by each range can be treated as an opaque blob, which contains a mixture of binary data and human-readable strings. The exact structure of the packet is unknown and may vary between system versions. However, it is observed that the packet contains a number of textual fields encoded in Windows-1252. These fields include:

- The discipline name
- Start list name
- Shooter names
- Additional, discipline-specific keywords such as *Vorbereitung/Probe* or *Wertung*
- Shooter-specific information such as club names

The exact layout of these fields within the packet is not fixed and may change between system versions. Therefore, the interface should not rely on fixed offsets or a specific packet structure to extract this information.

---

#### Observed naming properties

Based on observations across supported ShootMaster versions and real-world installations, the following characteristics are typically true for textual values contained in multicast packets. These characteristics form the basis for some of the heuristics used during range state extraction.

The following observations apply to discipline names, shooter names, and start list names:

1. Discipline names are rather short ("LG 40", "KK 50m", etc.)
2. Start list names are often long.
3. Shooter names are stored in the packet as "Lastname, Firstname"
4. None of the values are guaranteed to be unique, as multiple disciplines, start lists, or shooters with the same name may exist.
5. The ShootMaster system does not enforce any specific formatting for these values, neither in terms of content nor in length.

These characteristics are not formally guaranteed by the protocol but are consistently observed across supported ShootMaster versions. The heuristic extraction logic described below relies on these observations.

Since the packet only contains textual values and does not include unique identifiers for these entities, it is not possible to reliably distinguish between entities that share the same name based on packet content alone. Therefore, special care has to be taken in the processing logic to handle such cases, as described in the range state extraction section below.

### Processing Pipeline

The **dc-ranges-multicast-proxy** receives the packets on the specified multicast address. It re-encodes the packet from Windows-1252 to a UTF-8 string and sends the following to the main interface container:

- The packet content as a UTF-8 string representation
- The MAC address of the sender
- The current IP address of the range

#### Range Identification

The display controller maintains a mapping between a range’s MAC address and its range number. The range number is determined using this mapping as follows:

1. The system queries the mapping for a range entry matching the sender’s MAC address.
2. If a matching entry is found, the associated RangeId is used.
3. If no entry exists for the MAC address, the system attempts a fallback strategy:
   - The last octet of the sender’s IP address is extracted (for example, `20` from `192.168.10.20`).
   - This value is interpreted as a candidate RangeId.
   - If this RangeId is not already assigned in the database, it is accepted.
4. When a new RangeId is determined through the fallback strategy, a new mapping between the MAC address and the RangeId is created and stored in the database.

This fallback strategy follows a ip address convention defined by the manufacturer of the system, where the last octet of the range’s IP address corresponds to its range number for ranges 1 - 159. (see [Standard IP-Adressen von Geräten in
einem Meyton Netzwerk](https://software.meyton.info/wp-content/uploads/Upload/Manuals/DE/Inbetriebnahme/Standard_IP-Adressen_von_Geraeten_in_einem_Meyton_Netzwerk.pdf)) As most installations are smaller than 160 ranges, this convention is widely used in practice. However, it is not guaranteed to be followed in all installations, and therefore the fallback strategy only accepts the candidate RangeId if it is not already assigned to another range.

If the IP-based candidate does not reflect the actual RangeId, the mapping can be corrected manually. Once established, MAC-based identification remains authoritative and independent of subsequent IP address changes.

---

#### Range State Extraction

The interface maintains a local cache of all disciplines, shooters, and start lists known by the ShootMaster server. It is refreshed periodically to reflect changes in the underlying data.

After receiving a packet and determining the corresponding RangeId, the interface attempts to extract the current state of the range from the packet content. This is done in the following steps:

The packet content is scanned for occurrences of all known discipline names, shooter names, and start list names. Each occurrence is recorded as a candidate for the current range state, including the position of the match within the packet. This results in a set of candidates for each category (discipline, shooter, start list) that may be present in the packet.

If multiple shooters share the same name, they are grouped together as a single candidate, no longer being identified by a unique id, but instead being identified by their shared name. This is because the packet does not contain any unique identifiers for these entities, and it cannot be determined which of the shooters with the same name is actually present in the range.

A first filtering step is applied to the candidate set. It removes all candidates that are completely contained within another candidate of the same type. This is because the string values are surrounded by binary data that, in most cases, does not represent valid strings. Therefore, it can be assumed that the longest match is likely the correct one, as it matches the entire string value, while shorter matches may be partial matches of the same value.

For example, if the packet contains the string "LG 40", it may match both the discipline "LG 40" and the discipline "LG". In this case, the candidate for "LG" would be removed, as it is fully contained within the longer match "LG 40".

In the later extraction steps, further logical filtering is applied to the candidate set based on the identified entities. A candidate is only accepted as the identified entity if it is the only remaining candidate for that entity type after all filtering steps. This means that if multiple candidates remain for a category, no identification is made for that category, as it cannot be determined which candidate is correct.

After each identification, all candidates that overlap with the identified candidate are removed, irrespective of their type. This is because the identified candidate is assumed to be correct, and any overlapping candidates are likely to be false positives.

Based on empirical observation, each relevant textual value (such as a discipline name, start list name, or shooter name) appears only once within a packet. The value is surrounded by binary data that does not represent additional valid textual content.

Based on this observation, overlapping candidates are considered mutually exclusive. If a candidate is accepted as correct, any other candidate whose match overlaps with the accepted candidate is assumed to be a false positive and is removed from further consideration.

##### Start List extraction

After extracting the candidates in the previous step, the system checks the number of remaining candidates for the start list. If there is more than one candidate, identification is skipped and will be attempted again after attempting to identify the discipline and shooter.

If there is exactly one candidate, it is accepted as the identified start list. The identified candidate gets removed from the candidate set for the next steps, as well as any candidate that fully or partially overlaps with it. This is because if a start list is identified, its characters cannot be part of any other candidate.

If there is no candidate, which is a valid state of the range, the start list is reported as empty.

##### Discipline Extraction

After the start list extraction, the system checks the number of remaining candidates for the discipline.

###### Contextual Filtering

First, discipline candidates that are unlikely to be correct are filtered based on the identified start list.

This filtering only needs to be applied on price shooting start lists, as they are the only start lists to define their own, dedicated disciplines that are not used in other contexts.

- If the identified startlist (or all remaining start list candidates) is of type price shooting:
  - All discipline candidates belonging to specializations of other price shootings are removed
  - Base disciplines are retained, as they may still be used in price shooting contexts.
- If the identified start list (or all remaining start list candidates) is not of type price shooting:
  - All discipline candidates that belong to any price shooting specialization are removed

If no start list could be identified, this filtering step is skipped, as no contextual information is available to determine which disciplines are unlikely.

###### Unique Resolution

If, after contextual filtering, exactly one discipline candidate remains, it is accepted as the identified discipline.

###### Candidate Combination

If multiple discipline candidates remain, the system evaluates wether they can be safely combined.

This combination is only considered, if none of the remaining discipline candidates overlap with candidates of other entity types. If such overlaps exist, no combination logic is applied, as removing candidates could discard important contextual information.

- If all specialization candidates point to the same specialization and this specialization belongs to the start list (or any of the start list candidates, as identified above), the specialization is selected as the final discipline. This reflects the domain observation, that, while technically possible, it is unlikely for a non-specialized discipline to be used in combination with a price shooting
- Otherwise, the base discipline is selected as the identified discipline. This fallback is considered safe, as specializations only affect presentation attributes such as name, identifier or color. Falling back to the base discipline therefore does not result in a loss of critical information

###### Empty States

If there is no discipline candidate, which is a possible - but invalid - state of the range, the discipline is reported as empty. This can happen, for example, if the range uses a discipline that is not known to the ShootMaster server, which is possible as the range maintains its own discipline list that can be different from the one on the server.

##### Shooter Extraction

After the discipline extraction, the system checks the number of remaining candidates for the shooter. For shooter candidates, no special conditions apply.

If there is exactly one remaining candidate, it is accepted as the identified shooter.

If there is no candidate, the range gets classified as empty, which is the normal state of a range after startup or when no shooter is assigned to the range.

Because candidate elimination is applied after each identification, the extraction of one entity can lead to the successful identification of another entity that was previously ambiguous. Because of this, the extraction process is executed twice, allowing the system to retry extraction after further candidates have been removed in the previous iteration. During this retry, the system does not override any previous identifications. It does not need to be executed more than twice, as after two iterations, no further candidates can be removed based on the identified entities, and therefore no new identification can be made.

## Known Limitations

Due to the heuristic and text-based nature of the extraction algorithm, the interface has several inherent limitations.

### Name Collisions

The extraction process relies entirely on textual matching and does not use unique identifiers. As a result, name collisions cannot always be resolved reliably.

- **Within the same entity type**  
  Multiple disciplines or start lists sharing the same name cannot be uniquely identified and are excluded from matching.  
  Multiple shooters sharing the same name are grouped and identified only by name.

- **Across entity types**  
  If a discipline, start list, or shooter share the same name, the algorithm may not be able to determine the correct entity type.

### Reserved or Common Keywords

The packet contains fixed textual keywords (e.g., round names such as *Wertung* or *Probe*). If a discipline or start list uses such a keyword as its name, false positives may occur.

### Out-of-Sync Discipline Lists

The range maintains its own discipline list, which must be synchronized with the ShootMaster server. If the range uses a discipline that is not present in the server-side cache, it cannot be detected by this interface.

### Assumption of Single Occurrence

The algorithm assumes that each relevant textual value appears only once per packet. If future protocol versions introduce multiple occurrences of the same value, overlapping-candidate elimination may produce incorrect results.

### Heuristic Matching

Containment-based filtering and longest-match selection are heuristic strategies. In rare edge cases involving closely related names, this may result in incorrect identification.

### Protocol and Encoding Changes

The implementation assumes that relevant data is embedded as human-readable Windows-1252 encoded strings within the packet. Significant protocol or encoding changes may prevent extraction entirely.

Despite these limitations, the approach has proven stable across multiple ShootMaster releases and real-world installations since 2022, supporting all ShootMaster releases after 4.9.7a.
