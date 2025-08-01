import math
import random
import string

# This script generates a dart svg graphic
# based on the radius of the dartboard

RADIUS = 4500  # 6249  # 4500
FILE_NAME = "dartboard_lg.svg"  # "dartboard_lp.svg"  # "dartboard_lg.svg"
WHITE = "#f0d8b8"
BLACK = "#000000"
GREEN = "#28a040"
RED = "#f81810"
CLASS_LENGTH = 20

CLASS_PREFIX = FILE_NAME.split(".")[0].lower() + "_"

WHITE_CLASS = CLASS_PREFIX + "".join(
    random.choices(string.ascii_letters + string.digits, k=20)
)
BLACK_CLASS = CLASS_PREFIX + "".join(
    random.choices(string.ascii_letters + string.digits, k=20)
)
GREEN_CLASS = CLASS_PREFIX + "".join(
    random.choices(string.ascii_letters + string.digits, k=20)
)
RED_CLASS = CLASS_PREFIX + "".join(
    random.choices(string.ascii_letters + string.digits, k=20)
)

print(
    f"WHITE_CLASS: {WHITE_CLASS}, BLACK_CLASS: {BLACK_CLASS}, GREEN_CLASS: {GREEN_CLASS}, RED_CLASS: {RED_CLASS}"
)


def generate_slice(radius, start_angle, end_angle, class_name):
    start_angle = (start_angle - 90) % 360
    end_angle = (end_angle - 90) % 360
    # Calculate the coordinates of the points for the slice
    x1 = radius * math.cos(math.radians(start_angle)) + (RADIUS - radius)
    y1 = radius * math.sin(math.radians(start_angle)) + (RADIUS - radius)
    x2 = radius * math.cos(math.radians(end_angle)) + (RADIUS - radius)
    y2 = radius * math.sin(math.radians(end_angle)) + (RADIUS - radius)

    # Create the SVG path for the slice
    path_data = f"M {RADIUS} {RADIUS} L {x1 + radius} {y1 + radius} A {radius} {radius} 0 0 1 {x2 + radius} {y2 + radius} Z"
    return f'<path d="{path_data}" class="{class_name}" />\n'


def generate_text(cx, cy, text, class_name):
    return f'<text x="{cx}" y="{cy}" class="{class_name}" text-anchor="middle" dominant-baseline="middle">{text}</text>\n'


def generate_dart_slice(start_angle, end_angle, value, bg_class, hlt_class, text_class):
    slice = f'<g class="dart-{value}">\n'
    slice += generate_slice(RADIUS, start_angle, end_angle, hlt_class)
    slice += generate_slice(RADIUS * (162 / 170), start_angle, end_angle, bg_class)
    slice += generate_slice(RADIUS * (107 / 170), start_angle, end_angle, hlt_class)
    slice += generate_slice(RADIUS * (99 / 170), start_angle, end_angle, bg_class)

    cx = RADIUS + (RADIUS * (162 / 170) + RADIUS * (107 / 170)) / 2 * math.cos(
        math.radians((start_angle + end_angle) / 2 - 90)
    )
    cy = RADIUS + (RADIUS * (162 / 170) + RADIUS * (107 / 170)) / 2 * math.sin(
        math.radians((start_angle + end_angle) / 2 - 90)
    )

    slice += generate_text(cx, cy, str(value), text_class)

    slice += "</g>\n"
    return slice


def generate_bulls(radius, red, green):
    # Create the outer circle (green)
    outer_circle = (
        f'<circle cx="{RADIUS}" cy="{RADIUS}" r="{radius}" fill="{green}" />\n'
    )
    # Create the inner circle (red)
    inner_circle = (
        f'<circle cx="{RADIUS}" cy="{RADIUS}" r="{radius * 0.40}" fill="{red}" />\n'
    )
    return outer_circle + inner_circle


def generate_svg():

    # CSS styles
    css_styles = f"""
    .{WHITE_CLASS} {{
        fill: {WHITE};
    }}
    .{BLACK_CLASS} {{
        fill: {BLACK};
    }}
    .{GREEN_CLASS} {{
        fill: {GREEN};
    }}
    .{RED_CLASS} {{
        fill: {RED};
    }}
    text.{WHITE_CLASS} {{
        fill: #ffffff;
    }}
    text.{BLACK_CLASS} {{
        fill: #000000;
    }}
    text {{
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: {RADIUS * 0.1}px;
    }}
    path, circle {{
        stroke: #000000;
        stroke-width: {RADIUS * 0.005}px;
    }}
    """

    css = f"<style>\n{css_styles}\n</style>"

    # SVG header
    svg_header = f'<svg width="{RADIUS * 2}" height="{RADIUS * 2}" xmlns="http://www.w3.org/2000/svg">'

    # SVG footer
    svg_footer = "</svg>"

    svg_content = ""
    for i, value in zip(
        range(0, 360, 18),
        [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5],
    ):
        bg_color = BLACK_CLASS if i % 36 == 0 else WHITE_CLASS
        hlt_color = RED_CLASS if i % 36 == 0 else GREEN_CLASS
        txt_color = WHITE_CLASS if i % 36 == 0 else BLACK_CLASS
        svg_content += generate_dart_slice(
            i - 9, i + 9, value, bg_color, hlt_color, txt_color
        )

    svg_content += generate_bulls(RADIUS * 0.095, RED, GREEN)

    return svg_header + css + svg_content + svg_footer


with open(FILE_NAME, "w") as file:
    svg_content = generate_svg()
    file.write(svg_content)
