import unittest
from dataclasses import asdict
from economy import Ledger, simulate
class EconomyTests(unittest.TestCase):
    def test_rejected_purchase_does_not_change_ledger(self):
        l=Ledger(); before=asdict(l); self.assertFalse(l.buy(5)); self.assertEqual(asdict(l),before)
    def test_conservation_across_long_run(self):
        for row in simulate(1000):
            self.assertGreaterEqual(row['balance'],0)
            self.assertEqual(row['balance'],4+row['generated']-row['destroyed'])
    def test_invalid_inputs_do_not_mint(self):
        for v in [-1, 1.5, True, '1']:
            l=Ledger(); before=asdict(l)
            with self.assertRaises(ValueError): l.buy(v)
            with self.assertRaises(ValueError): l.credit(v)
            self.assertEqual(asdict(l),before)
    def test_free_purchase_and_shop_reset(self):
        l=Ledger(); self.assertTrue(l.buy(0)); self.assertEqual(l.balance,4)
        rows=simulate(); self.assertEqual(len(rows),8)
        self.assertEqual(rows,simulate())
if __name__=='__main__': unittest.main()
