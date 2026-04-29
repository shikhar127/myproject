import SwiftUI

struct ContentView: View {
    @State private var die1: Int = 1
    @State private var die2: Int = 1
    @State private var isRolling = false
    @State private var rollCount = 0
    @State private var hasRolled = false
    @State private var showResult = false

    let burgundy = Color(red: 0.49, green: 0.15, blue: 0.27)

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    headerSection
                    diceSection
                    gridSection
                }
            }
            .background(Color(red: 0.98, green: 0.95, blue: 0.96))
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showResult) {
            if hasRolled {
                ResultView(
                    card: gameCards[die1 - 1][die2 - 1],
                    die1: die1,
                    die2: die2,
                    onDismiss: { showResult = false }
                )
            }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 6) {
            Text("🪩 🍸 💃")
                .font(.system(size: 32))
            Text("On a Roll")
                .font(.custom("Georgia-BoldItalic", size: 38))
                .foregroundColor(burgundy)
            Text("A BACHELORETTE DRINKING GAME")
                .font(.system(size: 11, weight: .semibold))
                .tracking(2)
                .foregroundColor(burgundy.opacity(0.7))
        }
        .padding(.top, 20)
        .padding(.bottom, 16)
    }

    private var diceSection: some View {
        VStack(spacing: 14) {
            HStack(spacing: 20) {
                DiceFaceView(value: die1, isRolling: isRolling)
                DiceFaceView(value: die2, isRolling: isRolling)
            }

            Button(action: rollDice) {
                HStack(spacing: 8) {
                    Text("🎲")
                        .font(.system(size: 20))
                    Text("ROLL THE DICE")
                        .font(.system(size: 17, weight: .bold))
                        .tracking(1.5)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(burgundy)
                .cornerRadius(14)
            }
            .disabled(isRolling)
            .padding(.horizontal, 24)
        }
        .padding(.vertical, 20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
        .padding(.horizontal, 16)
        .padding(.bottom, 20)
    }

    private var gridSection: some View {
        VStack(spacing: 0) {
            // Column headers
            HStack(spacing: 0) {
                Color.clear.frame(width: 44, height: 44)
                ForEach(1...6, id: \.self) { col in
                    DiceHeaderView(value: col, highlight: hasRolled && die2 == col)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 8)

            // Rows
            ForEach(1...6, id: \.self) { row in
                HStack(spacing: 0) {
                    DiceHeaderView(value: row, highlight: hasRolled && die1 == row)
                        .frame(width: 44)
                    ForEach(1...6, id: \.self) { col in
                        let card = gameCards[row - 1][col - 1]
                        let isHighlighted = hasRolled && die1 == row && die2 == col
                        CardCell(card: card, isHighlighted: isHighlighted)
                            .frame(maxWidth: .infinity)
                            .onTapGesture {
                                if isHighlighted {
                                    showResult = true
                                }
                            }
                    }
                }
                .padding(.horizontal, 8)
            }
        }
        .padding(.bottom, 30)
    }

    private func rollDice() {
        isRolling = true
        hasRolled = false

        // Animate rapid random values
        var rollsLeft = 12
        func tick() {
            guard rollsLeft > 0 else {
                let finalD1 = Int.random(in: 1...6)
                let finalD2 = Int.random(in: 1...6)
                withAnimation(.spring()) {
                    die1 = finalD1
                    die2 = finalD2
                    isRolling = false
                    hasRolled = true
                    rollCount += 1
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    showResult = true
                }
                return
            }
            die1 = Int.random(in: 1...6)
            die2 = Int.random(in: 1...6)
            rollsLeft -= 1
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.07) { tick() }
        }
        tick()
    }
}

struct DiceFaceView: View {
    let value: Int
    let isRolling: Bool

    let burgundy = Color(red: 0.49, green: 0.15, blue: 0.27)

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 18)
                .fill(burgundy)
                .frame(width: 90, height: 90)
                .shadow(color: burgundy.opacity(0.4), radius: 6, x: 0, y: 3)

            DotPattern(value: value)
                .frame(width: 66, height: 66)
        }
        .rotationEffect(.degrees(isRolling ? Double.random(in: -15...15) : 0))
        .animation(isRolling ? .easeInOut(duration: 0.07).repeatForever(autoreverses: true) : .spring(), value: isRolling)
    }
}

struct DotPattern: View {
    let value: Int

    var body: some View {
        let layout = dotPositions(for: value)
        ZStack {
            ForEach(0..<layout.count, id: \.self) { i in
                Circle()
                    .fill(Color.white)
                    .frame(width: 14, height: 14)
                    .position(x: layout[i].x * 66, y: layout[i].y * 66)
            }
        }
    }

    func dotPositions(for value: Int) -> [CGPoint] {
        switch value {
        case 1: return [CGPoint(x: 0.5, y: 0.5)]
        case 2: return [CGPoint(x: 0.25, y: 0.25), CGPoint(x: 0.75, y: 0.75)]
        case 3: return [CGPoint(x: 0.25, y: 0.25), CGPoint(x: 0.5, y: 0.5), CGPoint(x: 0.75, y: 0.75)]
        case 4: return [CGPoint(x: 0.25, y: 0.25), CGPoint(x: 0.75, y: 0.25),
                        CGPoint(x: 0.25, y: 0.75), CGPoint(x: 0.75, y: 0.75)]
        case 5: return [CGPoint(x: 0.25, y: 0.25), CGPoint(x: 0.75, y: 0.25),
                        CGPoint(x: 0.5, y: 0.5),
                        CGPoint(x: 0.25, y: 0.75), CGPoint(x: 0.75, y: 0.75)]
        case 6: return [CGPoint(x: 0.25, y: 0.2), CGPoint(x: 0.75, y: 0.2),
                        CGPoint(x: 0.25, y: 0.5), CGPoint(x: 0.75, y: 0.5),
                        CGPoint(x: 0.25, y: 0.8), CGPoint(x: 0.75, y: 0.8)]
        default: return []
        }
    }
}

struct DiceHeaderView: View {
    let value: Int
    let highlight: Bool

    let burgundy = Color(red: 0.49, green: 0.15, blue: 0.27)

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(highlight ? Color.yellow.opacity(0.3) : burgundy)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(highlight ? Color.yellow : Color.clear, lineWidth: 2)
                )
            DotPattern(value: value)
                .frame(width: 24, height: 24)
                .colorMultiply(highlight ? .white : .white)
        }
        .frame(width: 36, height: 36)
        .padding(4)
    }
}

struct CardCell: View {
    let card: GameCard
    let isHighlighted: Bool

    var body: some View {
        VStack(spacing: 2) {
            Text(card.type.rawValue)
                .font(.system(size: 7, weight: .bold))
                .foregroundColor(card.type.color)
                .padding(.horizontal, 4)
                .padding(.vertical, 1)
                .background(card.type.color.opacity(0.12))
                .cornerRadius(3)

            Text(card.emoji)
                .font(.system(size: 14))

            Text(card.text)
                .font(.system(size: 7, weight: .medium))
                .multilineTextAlignment(.center)
                .foregroundColor(.black.opacity(0.75))
                .lineLimit(4)
                .minimumScaleFactor(0.7)
        }
        .padding(4)
        .frame(maxWidth: .infinity, minHeight: 70)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isHighlighted ? Color.yellow.opacity(0.25) : Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isHighlighted ? Color.yellow : Color(red: 0.85, green: 0.75, blue: 0.80).opacity(0.6), lineWidth: isHighlighted ? 2 : 0.5)
                )
        )
        .padding(2)
        .scaleEffect(isHighlighted ? 1.04 : 1.0)
        .animation(.spring(response: 0.3), value: isHighlighted)
    }
}

struct ResultView: View {
    let card: GameCard
    let die1: Int
    let die2: Int
    let onDismiss: () -> Void

    let burgundy = Color(red: 0.49, green: 0.15, blue: 0.27)

    var body: some View {
        ZStack {
            Color(red: 0.98, green: 0.95, blue: 0.96).ignoresSafeArea()

            VStack(spacing: 28) {
                Capsule()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 5)
                    .padding(.top, 12)

                Text("You rolled \(die1) + \(die2)!")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(burgundy.opacity(0.7))

                // Dice row
                HStack(spacing: 16) {
                    DiceFaceView(value: die1, isRolling: false)
                    Text("+")
                        .font(.system(size: 28, weight: .light))
                        .foregroundColor(burgundy)
                    DiceFaceView(value: die2, isRolling: false)
                }

                // Card result
                VStack(spacing: 14) {
                    Text(card.type.rawValue)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(card.type.color)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 5)
                        .background(card.type.color.opacity(0.12))
                        .cornerRadius(8)

                    Text(card.emoji)
                        .font(.system(size: 60))

                    Text(card.text)
                        .font(.system(size: 22, weight: .semibold))
                        .multilineTextAlignment(.center)
                        .foregroundColor(.black.opacity(0.85))
                        .padding(.horizontal, 24)
                }
                .padding(28)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.white)
                        .shadow(color: card.type.color.opacity(0.15), radius: 12, x: 0, y: 4)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(card.type.color.opacity(0.3), lineWidth: 1.5)
                        )
                )
                .padding(.horizontal, 24)

                Button(action: onDismiss) {
                    Text("Got it! 🎉")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(burgundy)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 24)

                Spacer()
            }
        }
    }
}
