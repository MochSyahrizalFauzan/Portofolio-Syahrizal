/* Framer-compatible controls metadata kept separate from runtime rendering. */
import { 
ControlType, addPropertyControls, STUDIO_URL, AFFILIATE_URL, PREVIEW_DESCRIPTION, PAPER, INK, ACCENT, STRAP, PAD_MIN, PAD_MAX, THICK_MIN, THICK_MAX, SIZE_MIN, SIZE_MAX, DEFAULT_CONTENT, DEFAULT_LOOK, DEFAULT_LIGHT, TYPE_GAP_MIN, TYPE_GAP_MAX, DEFAULT_LAYOUT, DEFAULT_PREVIEW, DEFAULT_ENTRANCE, asStrapStyle
 } from "./config"

export function registerLanyardControls(component: unknown): void {
    
    addPropertyControls(component, {
        content: {
            type: ControlType.Object,
            title: "Content",
            icon: "object",
            description: "Copy on the pass, top to bottom.",
            controls: {
                attendeeName: {
                    type: ControlType.String,
                    title: "Name",
                    defaultValue: DEFAULT_CONTENT.attendeeName,
                },
                ticketType: {
                    type: ControlType.String,
                    title: "Line",
                    defaultValue: DEFAULT_CONTENT.ticketType,
                    description: "Under the name.",
                },
                eventName: {
                    type: ControlType.String,
                    title: "Event",
                    defaultValue: DEFAULT_CONTENT.eventName,
                },
                eventDate: {
                    type: ControlType.String,
                    title: "Date",
                    defaultValue: DEFAULT_CONTENT.eventDate,
                },
                ticketNumber: {
                    type: ControlType.String,
                    title: "Number",
                    defaultValue: DEFAULT_CONTENT.ticketNumber,
                },
                barcodeValue: {
                    type: ControlType.String,
                    title: "Barcode",
                    defaultValue: DEFAULT_CONTENT.barcodeValue,
                    description: "Empty hides the bars.",
                },
                backText: {
                    type: ControlType.String,
                    title: "Back",
                    defaultValue: "",
                    placeholder: "Number",
                    description:
                        "Line under the reverse logo. Empty prints the number.",
                },
                strapText: {
                    type: ControlType.String,
                    title: "Strap",
                    defaultValue: "",
                    placeholder: "Event name",
                    description:
                        "Printed on a flat lanyard. Empty repeats the event.",
                    hidden: (_content: unknown, root: unknown) =>
                        asStrapStyle(
                            (
                                root as
                                    | { look?: { strapStyle?: unknown } }
                                    | undefined
                            )?.look?.strapStyle
                        ) === "cord",
                },
            },
            defaultValue: DEFAULT_CONTENT,
        },
        look: {
            type: ControlType.Object,
            title: "Look",
            icon: "color",
            description: "Palette, art, materials, type.",
            controls: {
                paper: {
                    type: ControlType.Color,
                    title: "Paper",
                    defaultValue: PAPER,
                },
                ink: {
                    type: ControlType.Color,
                    title: "Ink",
                    defaultValue: INK,
                },
                accent: {
                    type: ControlType.Color,
                    title: "Accent",
                    defaultValue: ACCENT,
                    description: "Letter stamp if logo is empty.",
                },
                strapStyle: {
                    type: ControlType.Enum,
                    title: "Strap",
                    options: ["flat", "cord"],
                    optionTitles: ["Flat", "Cord"],
                    defaultValue: "flat",
                    displaySegmentedControl: true,
                    description: "Cord hides strap copy. Flat can print a line.",
                },
                strapColor: {
                    type: ControlType.Color,
                    title: "Color",
                    defaultValue: STRAP,
                    description: "Flat or cord.",
                },
                logo: {
                    type: ControlType.ResponsiveImage,
                    title: "Logo",
                    description: "Front and reverse. Empty uses a letter stamp.",
                },
                photo: {
                    type: ControlType.ResponsiveImage,
                    title: "Photo",
                    description: "Portrait or art on the front.",
                },
                photoFit: {
                    type: ControlType.Enum,
                    title: "Frame",
                    options: ["cover", "inset"],
                    optionTitles: ["Full art", "Inset"],
                    defaultValue: "cover",
                    displaySegmentedControl: true,
                    description:
                        "Full art fills the face. Type sits on a paper wash.",
                },
                backArt: {
                    type: ControlType.ResponsiveImage,
                    title: "Back art",
                    description: "Full-bleed reverse. Empty keeps the ink face.",
                },
                finish: {
                    type: ControlType.Enum,
                    title: "Finish",
                    options: ["gloss", "matte", "linen"],
                    optionTitles: ["Gloss", "Matte", "Linen"],
                    defaultValue: "gloss",
                    displaySegmentedControl: true,
                    segmentedControlDirection: "vertical",
                    description: "Card surface. Linen adds a fine woven grain.",
                },
                foil: {
                    type: ControlType.Boolean,
                    title: "Foil",
                    defaultValue: true,
                    enabledTitle: "On",
                    disabledTitle: "Off",
                    description: "Holo on the logo and the card edge.",
                },
                sleeve: {
                    type: ControlType.Boolean,
                    title: "Sleeve",
                    defaultValue: false,
                    enabledTitle: "On",
                    disabledTitle: "Off",
                    description: "PVC pocket over the card.",
                },
                sleeveTexture: {
                    type: ControlType.Enum,
                    title: "PVC",
                    options: ["clear", "frosted", "textured"],
                    optionTitles: ["Clear", "Frosted", "Textured"],
                    defaultValue: "clear",
                    displaySegmentedControl: true,
                    segmentedControlDirection: "vertical",
                    hidden: (look: { sleeve?: boolean }) => !look.sleeve,
                    description: "Only while Sleeve is on.",
                },
                nameFont: {
                    type: ControlType.Font,
                    title: "Name",
                    controls: "extended",
                    defaultFontType: "sans-serif",
                    displayTextAlignment: false,
                    defaultValue: {
                        fontSize: "108px",
                        variant: "Semibold",
                        letterSpacing: "-0.045em",
                        lineHeight: "1em",
                    },
                },
                metaFont: {
                    type: ControlType.Font,
                    title: "Meta",
                    controls: "extended",
                    defaultFontType: "sans-serif",
                    displayTextAlignment: false,
                    defaultValue: {
                        fontSize: "22px",
                        variant: "Regular",
                        letterSpacing: "0.01em",
                        lineHeight: "1.2em",
                    },
                    description: "Event, date, line, barcode caption, strap.",
                },
                numberFont: {
                    type: ControlType.Font,
                    title: "Number",
                    controls: "extended",
                    defaultFontType: "sans-serif",
                    displayTextAlignment: false,
                    defaultValue: {
                        fontSize: "48px",
                        variant: "Semibold",
                        letterSpacing: "-0.04em",
                        lineHeight: "1em",
                    },
                },
            },
            defaultValue: DEFAULT_LOOK,
        },
        layout: {
            type: ControlType.Object,
            title: "Layout",
            icon: "object",
            description: "Stage, card depth, print inset.",
            controls: {
                size: {
                    type: ControlType.Number,
                    title: "Size",
                    defaultValue: DEFAULT_LAYOUT.size,
                    min: SIZE_MIN,
                    max: SIZE_MAX,
                    step: 8,
                    unit: "px",
                    displayStepper: false,
                    description: "How large the pass sits in the stage.",
                },
                thickness: {
                    type: ControlType.Number,
                    title: "Thickness",
                    defaultValue: DEFAULT_LAYOUT.thickness,
                    min: THICK_MIN,
                    max: THICK_MAX,
                    step: 0.2,
                    unit: "mm",
                    description:
                        "Real PVC is about 0.8. Badges read best at 2 to 6.",
                },
                padding: {
                    type: ControlType.Number,
                    title: "Padding",
                    defaultValue: DEFAULT_LAYOUT.padding,
                    min: PAD_MIN,
                    max: PAD_MAX,
                    step: 2,
                    unit: "px",
                    displayStepper: false,
                    description: "Print inset on the badge faces.",
                },
                stackGap: {
                    type: ControlType.Number,
                    title: "Type gap",
                    defaultValue: DEFAULT_LAYOUT.stackGap,
                    min: TYPE_GAP_MIN,
                    max: TYPE_GAP_MAX,
                    unit: "%",
                    step: 1,
                    displayStepper: false,
                    description:
                        "Space under the name, as a share of the name size.",
                },
            },
            defaultValue: DEFAULT_LAYOUT,
        },
        light: {
            type: ControlType.Object,
            title: "Light",
            icon: "effect",
            description: "Key light on the badge.",
            controls: {
                angle: {
                    type: ControlType.Number,
                    title: "Angle",
                    defaultValue: DEFAULT_LIGHT.angle,
                    min: -180,
                    max: 180,
                    step: 5,
                    unit: "Â°",
                    description: "0 is straight ahead. Positive is from the right.",
                },
                height: {
                    type: ControlType.Number,
                    title: "Height",
                    defaultValue: DEFAULT_LIGHT.height,
                    min: -20,
                    max: 85,
                    step: 5,
                    unit: "Â°",
                },
                intensity: {
                    type: ControlType.Number,
                    title: "Intensity",
                    defaultValue: DEFAULT_LIGHT.intensity,
                    min: 0,
                    max: 2,
                    step: 0.05,
                },
                rim: {
                    type: ControlType.Boolean,
                    title: "Rim",
                    defaultValue: true,
                    enabledTitle: "On",
                    disabledTitle: "Off",
                    description: "Cold edge light from behind.",
                },
            },
            defaultValue: DEFAULT_LIGHT,
        },
        motion: {
            type: ControlType.Boolean,
            title: "Motion",
            defaultValue: true,
            enabledTitle: "On",
            disabledTitle: "Off",
            description:
                "Grab, throw, settle. Off holds the rest pose. Canvas and reduced-motion stay still.",
        },
        entrance: {
            type: ControlType.Object,
            title: "Entrance",
            icon: "effect",
            description:
                "Drop: the pass falls in from above and the strap catches it. Motion off and reduced motion skip it.",
            controls: {
                entrance: {
                    type: ControlType.Enum,
                    title: "Style",
                    options: ["none", "drop"],
                    optionTitles: ["None", "Drop"],
                    defaultValue: DEFAULT_ENTRANCE.entrance,
                    displaySegmentedControl: true,
                },
                entrancePlay: {
                    type: ControlType.Enum,
                    title: "Play",
                    options: ["load", "session"],
                    optionTitles: ["Every load", "Once per session"],
                    defaultValue: DEFAULT_ENTRANCE.entrancePlay,
                    description:
                        "Once per session: only the first page view in a browser session drops.",
                    hidden: (group: { entrance?: string }) => group.entrance !== "drop",
                },
            },
            defaultValue: DEFAULT_ENTRANCE,
        },
        preview: {
            type: ControlType.Object,
            title: "Preview",
            icon: "object",
            description: PREVIEW_DESCRIPTION,
            controls: {
                exploreMore: {
                    type: ControlType.Link,
                    title: "Explore more",
                    defaultValue: STUDIO_URL,
                    description: PREVIEW_DESCRIPTION,
                },
                madeForFramer: {
                    type: ControlType.Link,
                    title: "Made for Framer",
                    defaultValue: AFFILIATE_URL,
                    description:
                        "[Made for Framer](https://framer.link/qIg9LiG) â€” referral. Panel only.",
                },
            },
            defaultValue: DEFAULT_PREVIEW,
        },
    })
}
