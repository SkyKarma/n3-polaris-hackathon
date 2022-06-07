using System.ComponentModel;
using System.Numerics;
using Neo;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        [DisplayName("Transfer")]
        public static event OnTransferEvent onTransfer;
        public delegate void OnTransferEvent(UInt160 from, UInt160 to, BigInteger amount);
        
        public static event SyncedEvent Synced;
        public delegate void SyncedEvent(BigInteger balance0, BigInteger balance1);

        public static event FaultEvent onFault;
        public delegate void FaultEvent(string message, params object[] paras);

        public static event SwappedEvent Swapped;
        public delegate void SwappedEvent(UInt160 caller, BigInteger amount0In, BigInteger amount1In, BigInteger amount0Out, BigInteger amount1Out, UInt160 to);

        public static event BurnedEvent Burned;
        public delegate void BurnedEvent(UInt160 caller, BigInteger liquidity, BigInteger amount0, BigInteger amount1, UInt160 to);

        public static event MintedEvent Minted;
        public delegate void MintedEvent(UInt160 caller, BigInteger amount0, BigInteger amount1, BigInteger liquidity);
        
        public static event DeployedEvent Deployed;
        public delegate void DeployedEvent(UInt160 token0, UInt160 token1);
    }
}