"""Illustrative integer-unit model, not observed behavior or a financial forecast."""
from dataclasses import dataclass, asdict
import json

@dataclass
class Ledger:
    balance: int = 4
    generated: int = 0
    destroyed: int = 0
    def credit(self, amount):
        if type(amount) is not int or amount < 0:
            raise ValueError('reward must be a nonnegative integer')
        self.balance += amount
        self.generated += amount
    def buy(self, price):
        if type(price) is not int or price < 0:
            raise ValueError('price must be a nonnegative integer')
        if self.balance < price:
            return False
        self.balance -= price
        self.destroyed += price
        return True

def simulate(rounds=8):
    if type(rounds) is not int or rounds < 0:
        raise ValueError('rounds must be a nonnegative integer')
    ledger = Ledger()
    rows = []
    for round_no in range(1, rounds + 1):
        ledger.credit(6)
        packs = sum(ledger.buy(4) for _ in range(1 if round_no <= 3 else 2))
        rerolls = 0
        for price in range(1, 4):
            if not ledger.buy(price): break
            rerolls += 1
        assert ledger.balance == 4 + ledger.generated - ledger.destroyed
        rows.append({'round':round_no, 'packs':packs, 'rerolls':rerolls, **asdict(ledger)})
    return rows

if __name__ == '__main__':
    print(json.dumps(simulate(), indent=2))
