using System.ComponentModel;
using System.Numerics;
using Neo;

namespace PumpkinSwapTimeLock
{
    public partial class PumpkinSwapTimeLockContract
    {
        public delegate void OnLiquidityLockedDelegate(UInt160 from, UInt160 liquidity, BigInteger endDate, BigInteger amount);
        [DisplayName("LiquidityLocked")]
        public static event OnLiquidityLockedDelegate OnLiquidityLocked;

        public delegate void OnLiquidityUnlockedDelegate(UInt160 from, UInt160 liquidity, BigInteger amount);
        [DisplayName("LiquidityUnlocked")]
        public static event OnLiquidityUnlockedDelegate OnLiquidityUnlocked;
    }
}