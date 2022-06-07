using System.Numerics;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        private static StorageMap ReserveStorageMap => new StorageMap(Storage.CurrentContext, "CookieReserve");
        
        public static object GetReserves()
        {
            return ReservePair;
        }
        
        [Safe]
        public static BigInteger GetReserve0()
        {
            var r = ReservePair;
            return r.Reserve0;
        }

        [Safe]
        public static BigInteger GetReserve1()
        {
            var r = ReservePair;
            return r.Reserve1;
        }

        private static ReservesData ReservePair
        {
            get
            {
                var val = ReserveStorageMap.Get(nameof(ReservePair));
                if (val is null || val.Length == 0)
                {
                    return new ReservesData() { Reserve0 = 0, Reserve1 = 0 };
                }
                var b = (ReservesData)StdLib.Deserialize(val);
                return b;
            }
            set
            {

                var val = StdLib.Serialize(value);
                ReserveStorageMap.Put(nameof(ReservePair), val);
            }
        }
    }
    public struct ReservesData
    {
        public BigInteger Reserve0;
        public BigInteger Reserve1;
    }
}
