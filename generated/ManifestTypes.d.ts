/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    parametersBPF: ComponentFramework.PropertyTypes.StringProperty;
    designStyle: ComponentFramework.PropertyTypes.EnumProperty<"chevron" | "circles" | "pills" | "segmented" | "timeline" | "stepper">;
    displayMode: ComponentFramework.PropertyTypes.EnumProperty<"stage" | "category">;
    recordNameSize: ComponentFramework.PropertyTypes.EnumProperty<"small" | "medium" | "large">;
    showEntityName: ComponentFramework.PropertyTypes.EnumProperty<"yes" | "no">;
    enableNavigation: ComponentFramework.PropertyTypes.EnumProperty<"yes" | "no">;
    showPulseAnimation: ComponentFramework.PropertyTypes.EnumProperty<"yes" | "no">;
    usePlatformTheme: ComponentFramework.PropertyTypes.EnumProperty<"yes" | "no">;
    completedColor: ComponentFramework.PropertyTypes.StringProperty;
    completedTextColor: ComponentFramework.PropertyTypes.StringProperty;
    activeColor: ComponentFramework.PropertyTypes.StringProperty;
    activeTextColor: ComponentFramework.PropertyTypes.StringProperty;
    inactiveColor: ComponentFramework.PropertyTypes.StringProperty;
    inactiveTextColor: ComponentFramework.PropertyTypes.StringProperty;
    records: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
}
