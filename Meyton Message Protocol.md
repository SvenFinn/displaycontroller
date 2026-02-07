# Meyton Message Protocol

Target IP: 224.0.0.3 UDP, Port:49497

| Start Address | Type     | Size (Bytes)   | Description                                                                                                 |
| ------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| 0x00          | bytes    | 36             | 00 00 03 01 06 08 53 19 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 51 00 00 00 00 00 00 00 01 00 00 00 |
| 0x24          | uint32   | 4              | Message ID, 0x35 for Message, 0xFB is for a simulated button press                                          |
| 0x28          | Bitfield | 52 / 53        | Target RangeNo (1-416), lsb of 0x28 gets ignored                                                            |
| 0x5D          | Unknown  | 79             | Padding? Always 0x00                                                                                        |
| 0xAC          | uint32   | 4              | Message Length                                                                                              |
| 0xB0          | char[]   | Message Length | ASCII (HTML) Message Content                                                                                |
