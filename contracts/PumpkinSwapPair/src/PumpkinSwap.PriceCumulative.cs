using System.Numerics;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        [Safe]
        public static PriceCumulative GetPriceCumulative()
        {
            return Cumulative;
        }

        [Safe]
        public static BigInteger Price0CumulativeLast()
        {
            return Cumulative.Price0CumulativeLast;
        }

        [Safe]
        public static BigInteger Price1CumulativeLast()
        {
            return Cumulative.Price1CumulativeLast;
        }
        
        private static StorageMap PriceCumulativeStorageMap => new StorageMap(Storage.CurrentContext, "CookiePrice");
        
        private static PriceCumulative Cumulative
        {
            get
            {
                var val = PriceCumulativeStorageMap.Get(nameof(Cumulative));
                if (val is null || val.Length == 0)
                {
                    return new PriceCumulative() { Price0CumulativeLast = 0, Price1CumulativeLast = 0, BlockTimestampLast = 0 };
                }
                var b = (PriceCumulative)StdLib.Deserialize(val);
                return b;
            }
            set
            {
                var val = StdLib.Serialize(value);
                PriceCumulativeStorageMap.Put(nameof(Cumulative), val);
            }
        }
    }

    public struct PriceCumulative
    {
        public BigInteger Price0CumulativeLast;
        public BigInteger Price1CumulativeLast;
        public BigInteger BlockTimestampLast;
    }
}
