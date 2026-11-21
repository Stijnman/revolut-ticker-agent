import unittest
from unittest.mock import patch
import stock_dashboard as app

class DashboardTests(unittest.TestCase):
    def test_unrecognized_ticker_rejected(self):
        with self.assertRaises(ValueError):
            app.quote("FAKE")

    def test_signal_thresholds(self):
        q = {"symbol": "NVDA", "change_pct": -3.1}
        self.assertIn("WATCH DIP", app.classify(q))
        q["change_pct"] = 5.1
        self.assertIn("WATCH MOMENTUM", app.classify(q))
        q["change_pct"] = 0
        self.assertEqual("WAIT", app.classify(q))

    def test_email_missing_credentials_fails_closed(self):
        with patch.dict("os.environ", {}, clear=True):
            self.assertFalse(app.send_email("x", "y")["sent"])

    def test_snapshot_error_is_not_buy(self):
        with patch.object(app, "quote", side_effect=ValueError("bad data")):
            rows = app.snapshot()
        self.assertEqual(5, len(rows))
        self.assertTrue(all(r["signal"] == "NO DATA — NO SIGNAL" for r in rows))

if __name__ == "__main__":
    unittest.main()
