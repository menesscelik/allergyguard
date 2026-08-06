import WidgetKit
import SwiftUI

// MARK: - Model
struct Dose: Codable {
  let time: String
  let name: String
}

struct WidgetData: Codable {
  let next: Dose?
  let upcoming: [Dose]
  let count: Int
}

let APP_GROUP = "group.com.menescelik.allergyguard"

func loadWidgetData() -> WidgetData? {
  guard let defaults = UserDefaults(suiteName: APP_GROUP),
        let raw = defaults.string(forKey: "widget_data"),
        let data = raw.data(using: .utf8) else { return nil }
  return try? JSONDecoder().decode(WidgetData.self, from: data)
}

// MARK: - Timeline
struct DoseEntry: TimelineEntry {
  let date: Date
  let data: WidgetData?
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> DoseEntry {
    DoseEntry(date: Date(), data: WidgetData(next: Dose(time: "21:00", name: "Magnezyum"), upcoming: [], count: 1))
  }

  func getSnapshot(in context: Context, completion: @escaping (DoseEntry) -> Void) {
    completion(DoseEntry(date: Date(), data: loadWidgetData()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<DoseEntry>) -> Void) {
    let entry = DoseEntry(date: Date(), data: loadWidgetData())
    let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - Renkler
private let brand = Color(red: 0.0, green: 122/255, blue: 1.0)
private let brandDark = Color(red: 0.0, green: 82/255, blue: 200/255)

// MARK: - Görünümler
struct HeaderLabel: View {
  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: "pills.fill").font(.system(size: 13, weight: .bold))
      Text("Sonraki doz").font(.system(size: 12, weight: .semibold))
      Spacer(minLength: 0)
    }
    .foregroundColor(.white.opacity(0.92))
  }
}

struct NextDoseBlock: View {
  let data: WidgetData?
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      if let next = data?.next {
        Text(next.time)
          .font(.system(size: 40, weight: .bold, design: .rounded))
          .foregroundColor(.white)
        Text(next.name)
          .font(.system(size: 15, weight: .semibold))
          .foregroundColor(.white.opacity(0.9))
          .lineLimit(1)
      } else {
        Image(systemName: "checkmark.circle.fill")
          .font(.system(size: 30, weight: .bold))
          .foregroundColor(.white)
        Text("Bugün ilaç yok")
          .font(.system(size: 16, weight: .bold))
          .foregroundColor(.white)
      }
    }
  }
}

struct SmallWidgetView: View {
  let data: WidgetData?
  var body: some View {
    VStack(alignment: .leading) {
      HeaderLabel()
      Spacer()
      NextDoseBlock(data: data)
      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }
}

struct MediumWidgetView: View {
  let data: WidgetData?
  var body: some View {
    HStack(alignment: .top, spacing: 18) {
      VStack(alignment: .leading) {
        HeaderLabel()
        Spacer()
        NextDoseBlock(data: data)
      }
      if let up = data?.upcoming, !up.isEmpty {
        VStack(alignment: .leading, spacing: 10) {
          Text("Sıradakiler")
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(.white.opacity(0.7))
          ForEach(Array(up.prefix(3).enumerated()), id: \.offset) { _, dose in
            HStack(spacing: 8) {
              Text(dose.time)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .frame(width: 46, alignment: .leading)
              Text(dose.name)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.85))
                .lineLimit(1)
            }
          }
          Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }
}

struct AllergyWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  var entry: Provider.Entry

  var body: some View {
    Group {
      if family == .systemMedium {
        MediumWidgetView(data: entry.data)
      } else {
        SmallWidgetView(data: entry.data)
      }
    }
    .padding(16)
    .containerBackground(for: .widget) {
      LinearGradient(colors: [brand, brandDark], startPoint: .topLeading, endPoint: .bottomTrailing)
    }
  }
}

struct AllergyWidget: Widget {
  let kind: String = "AllergyWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      AllergyWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Sonraki İlaç")
    .description("Sıradaki ilaç dozunu ve saatini gösterir.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
