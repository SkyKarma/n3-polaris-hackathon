using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        public static class EnteredStorage
        {
            public static readonly string mapName = "entered";

            public static void Put(BigInteger value) => new StorageMap(Storage.CurrentContext, mapName).Put(mapName, value);

            public static BigInteger Get()
            {
                var value = new StorageMap(Storage.CurrentContext, mapName).Get(mapName);
                return value is null ? 0 : (BigInteger)value;
            }
        }

        public static bool Swap(BigInteger amount0Out, BigInteger amount1Out, UInt160 toAddress, byte[] data = null)
        {
            Assert(EnteredStorage.Get() == 0, "Re-entered");
            EnteredStorage.Put(1);

            Assert(toAddress.IsAddress(), "Invalid To-Address");
            var caller = Runtime.CallingScriptHash;

            var me = Runtime.ExecutingScriptHash;

            Assert(amount0Out >= 0 && amount1Out >= 0, "Invalid AmountOut");
            Assert(amount0Out > 0 || amount1Out > 0, "Invalid AmountOut");

            var r = ReservePair;

            Assert(amount0Out < r.Reserve0 && amount1Out < r.Reserve1, "Insufficient Liquidity");
            Assert(toAddress != (UInt160)Token0 && toAddress != (UInt160)Token1 && toAddress != me, "INVALID_TO");

            if (amount0Out > 0)
            {
                SafeTransfer(Token0, me, toAddress, amount0Out, data);
            }
            if (amount1Out > 0)
            {
                SafeTransfer(Token1, me, toAddress, amount1Out, data);
            }


            BigInteger balance0 = DynamicBalanceOf(Token0, me);
            BigInteger balance1 = DynamicBalanceOf(Token1, me);

            var amount0In = balance0 > (r.Reserve0 - amount0Out) ? balance0 - (r.Reserve0 - amount0Out) : 0;
            var amount1In = balance1 > (r.Reserve1 - amount1Out) ? balance1 - (r.Reserve1 - amount1Out) : 0;

            Assert(amount0In > 0 || amount1In > 0, "Invalid AmountIn");

            var balance0Adjusted = balance0 * MINIMUM_LIQUIDITY - amount0In * 3;
            var balance1Adjusted = balance1 * MINIMUM_LIQUIDITY - amount1In * 3;

            Assert(balance0Adjusted * balance1Adjusted >= r.Reserve0 * r.Reserve1 * 1_000_000, "K");

            Update(balance0, balance1, r);

            Swapped(caller, amount0In, amount1In, amount0Out, amount1Out, toAddress);
            EnteredStorage.Put(0);
            return true;
        }

        private static void SafeTransfer(UInt160 token, UInt160 from, UInt160 to, BigInteger amount, byte[] data = null)
        {
            var result = (bool)Contract.Call(token, "transfer", CallFlags.All, new object[] { from, to, amount, data });
            Assert(result, "Transfer Fail", token);
        }

        private static BigInteger DynamicBalanceOf(UInt160 token, UInt160 address)
        {
            return (BigInteger)Contract.Call(token, "balanceOf", CallFlags.ReadOnly, new object[] { address });
        }
    }
}