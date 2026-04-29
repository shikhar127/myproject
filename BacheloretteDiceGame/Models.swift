import SwiftUI

enum CardType: String {
    case dare = "DARE"
    case drink = "DRINK"
    case fun = "FUN"
    case rule = "RULE"

    var color: Color {
        switch self {
        case .dare:  return Color(red: 0.85, green: 0.33, blue: 0.20)
        case .drink: return Color(red: 0.78, green: 0.25, blue: 0.42)
        case .fun:   return Color(red: 0.20, green: 0.65, blue: 0.35)
        case .rule:  return Color(red: 0.45, green: 0.25, blue: 0.65)
        }
    }
}

struct GameCard: Identifiable {
    let id: String
    let type: CardType
    let emoji: String
    let text: String

    init(die1: Int, die2: Int, type: CardType, emoji: String, text: String) {
        self.id = "\(die1)-\(die2)"
        self.type = type
        self.emoji = emoji
        self.text = text
    }
}

// Full 6x6 grid: gameCards[die1-1][die2-1]
let gameCards: [[GameCard]] = [
    // Row 1 (die1 = 1)
    [
        GameCard(die1: 1, die2: 1, type: .dare,  emoji: "🎤", text: "30-sec speech about the bride"),
        GameCard(die1: 1, die2: 2, type: .drink, emoji: "👑", text: "Maid of Honour drinks"),
        GameCard(die1: 1, die2: 3, type: .fun,   emoji: "🥂", text: "Make a toast — group picks the topic"),
        GameCard(die1: 1, die2: 4, type: .drink, emoji: "💒", text: "Drink if you have more than 1 friend getting married this year"),
        GameCard(die1: 1, die2: 5, type: .dare,  emoji: "📸", text: "Say \"Cheese!\" — photo with the bride"),
        GameCard(die1: 1, die2: 6, type: .fun,   emoji: "❓", text: "Truth or Dare"),
    ],
    // Row 2 (die1 = 2)
    [
        GameCard(die1: 2, die2: 1, type: .fun,   emoji: "👯", text: "Pick 2 to drink with you"),
        GameCard(die1: 2, die2: 2, type: .drink, emoji: "🏢", text: "Drink if you work in Alison"),
        GameCard(die1: 2, die2: 3, type: .rule,  emoji: "🎲", text: "Roll again — lucky you!"),
        GameCard(die1: 2, die2: 4, type: .drink, emoji: "🔋", text: "Lowest phone battery drinks"),
        GameCard(die1: 2, die2: 5, type: .drink, emoji: "🎉", text: "Everybody drink up!"),
        GameCard(die1: 2, die2: 6, type: .dare,  emoji: "💃", text: "Dance It Out — show your best move"),
    ],
    // Row 3 (die1 = 3)
    [
        GameCard(die1: 3, die2: 1, type: .drink, emoji: "🔤", text: "Drink if you have a middle name"),
        GameCard(die1: 3, die2: 2, type: .drink, emoji: "💍", text: "Drink if you're married or engaged"),
        GameCard(die1: 3, die2: 3, type: .dare,  emoji: "🎵", text: "15-sec karaoke — your fave Bollywood banger"),
        GameCard(die1: 3, die2: 4, type: .fun,   emoji: "🌙", text: "Last to point finger to sky drinks"),
        GameCard(die1: 3, die2: 5, type: .drink, emoji: "💒", text: "Drink for every wedding you're attending this year"),
        GameCard(die1: 3, die2: 6, type: .fun,   emoji: "✌️", text: "Two Truths & a Lie"),
    ],
    // Row 4 (die1 = 4)
    [
        GameCard(die1: 4, die2: 1, type: .rule,  emoji: "📜", text: "Make a rule everyone follows all game"),
        GameCard(die1: 4, die2: 2, type: .drink, emoji: "🔨", text: "Drink if you've supervised a kitchen remodelling"),
        GameCard(die1: 4, die2: 3, type: .fun,   emoji: "🤝", text: "Choose a mate — they drink when you drink"),
        GameCard(die1: 4, die2: 4, type: .fun,   emoji: "🎶", text: "Rhyme Time — first to pause drinks"),
        GameCard(die1: 4, die2: 5, type: .fun,   emoji: "💋", text: "Kiss Marry Kill"),
        GameCard(die1: 4, die2: 6, type: .drink, emoji: "🏖️", text: "Drink if you've hooked up in Goa"),
    ],
    // Row 5 (die1 = 5)
    [
        GameCard(die1: 5, die2: 1, type: .fun,   emoji: "🎁", text: "Give out one drink"),
        GameCard(die1: 5, die2: 2, type: .dare,  emoji: "🤫", text: "Spill Your Secrets — share a wild hookup story"),
        GameCard(die1: 5, die2: 3, type: .fun,   emoji: "🤚", text: "Never Have I Ever — 3 fingers"),
        GameCard(die1: 5, die2: 4, type: .fun,   emoji: "💡", text: "Categories — first to fail drinks"),
        GameCard(die1: 5, die2: 5, type: .drink, emoji: "😬", text: "Respect Your Elders — drink if you're older than the bride"),
        GameCard(die1: 5, die2: 6, type: .drink, emoji: "🎬", text: "Drink if your partner has a Hindi film named after them"),
    ],
    // Row 6 (die1 = 6)
    [
        GameCard(die1: 6, die2: 1, type: .drink, emoji: "✈️", text: "Drink if you've been to Goa before"),
        GameCard(die1: 6, die2: 2, type: .fun,   emoji: "📱", text: "Read your last text message out loud"),
        GameCard(die1: 6, die2: 3, type: .dare,  emoji: "🔥", text: "Hot Seat — everyone asks the bride one question"),
        GameCard(die1: 6, die2: 4, type: .drink, emoji: "🍺", text: "Finish your drink!"),
        GameCard(die1: 6, die2: 5, type: .fun,   emoji: "😂", text: "Tell a funny story about the bride"),
        GameCard(die1: 6, die2: 6, type: .fun,   emoji: "😇", text: "Two Truths & a Lie — bride edition"),
    ],
]
