using System.Numerics;
using Neo;

namespace PumpkinSwapTimeLock
{
    public class TimeLock
    {
        public UInt160 Sender { get; set; }
        public UInt160 Liquidity { get; set; }
        public BigInteger EndDate { get; set; }
        public BigInteger Amount { get; set; }
        public BigInteger LiquidityCounter { get; set; }
    }

    public class ReadableTimeLock
    {
        public string Sender { get; set; }
        public string Lp { get; set; }
        public BigInteger EndDate { get; set; }
        public BigInteger Amount { get; set; }
        public BigInteger Counter { get; set; }
        
        public void SetCounter(BigInteger value)
        {
            this.Counter = value;
        }
        
        public void SetSender(string value)
        {
            this.Sender = value;
        }

        public void SetLp(string value)
        {
            this.Lp = value;
        }

        public void SetEndDate(BigInteger value)
        {
            this.EndDate = value;
        }
        public void SetAmount(BigInteger value)
        {
            this.Amount = value;
        }
    }
}