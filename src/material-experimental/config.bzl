entryPoints = [
    "mdc-autocomplete",
    "mdc-button",
    "mdc-button/testing",
    "mdc-card",
    "mdc-checkbox",
    "mdc-checkbox/testing",
    "mdc-chips",
    "mdc-chips/testing",
    "mdc-form-field",
    "mdc-form-field/testing",
    "mdc-input",
    "mdc-input/testing",
    "mdc-list",
    "mdc-menu",
    "mdc-menu/testing",
    "mdc-progress-bar",
    "mdc-progress-bar/testing",
    "mdc-radio",
    "mdc-select",
    "mdc-sidenav",
    "mdc-slide-toggle",
    "mdc-slide-toggle/testing",
    "mdc-slider",
    "mdc-slider/testing",
    "mdc-snackbar",
    "mdc-table",
    "mdc-tabs",
    "popover-edit",
]

# List of all non-testing entry-points of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not "/testing" in ep
]

# List of all testing entry-points of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS
]

# List of all non-testing entry-point targets of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_TARGETS = ["//src/material-experimental"] + \
                                ["//src/material-experimental/%s" % ep for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS]

# List of all testing entry-point targets of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_TESTING_TARGETS = ["//src/material-experimental/%s" % ep for ep in MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS]

MATERIAL_EXPERIMENTAL_SCSS_LIBS = [
    "//src/material-experimental/%s:%s_scss_lib" % (ep, ep.replace("-", "_"))
    # Only secondary entry-points declare theme files currently. Entry-points
    # which contain a slash are not in the top-level.
    for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS
    if not "/" in ep
]
