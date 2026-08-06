import ExpoModulesCore
import WidgetKit

public class AllergyWidgetModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AllergyWidget")

    Function("setData") { (json: String, group: String) in
      let defaults = UserDefaults(suiteName: group)
      defaults?.set(json, forKey: "widget_data")
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
