using System.ComponentModel;
using System.Numerics;

using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    [DisplayName("PumpkinSwapPair")]
    [ManifestExtra("Description", "Pumpkin pair")]
    [ContractPermission("*", new[] {"*"})]
    public partial class PumpkinSwapPair : SmartContract
    {
        const long MINIMUM_LIQUIDITY = 1000;
        public static BigInteger FIXED = 100_000_000_000_000_000;

        public static BigInteger Mint(UInt160 toAddress)
        {
            Assert(EnteredStorage.Get() == 0, "Re-entered");
            EnteredStorage.Put(1);
            Assert(toAddress.IsAddress(), "Invalid To-Address");

            var caller = Runtime.CallingScriptHash; //msg.sender
            Assert(CheckIsRouter(caller), "Only Router Can Mint");

            var me = Runtime.ExecutingScriptHash; //address(this)

            var r = ReservePair;
            var reserve0 = r.Reserve0;
            var reserve1 = r.Reserve1;
            var balance0 = DynamicBalanceOf(Token0, me);
            var balance1 = DynamicBalanceOf(Token1, me);

            var amount0 = balance0 - reserve0;
            var amount1 = balance1 - reserve1;

            var totalSupply = TotalSupply();

            BigInteger liquidity;
            if (totalSupply == 0)
            {
                liquidity = (amount0 * amount1).Sqrt() - MINIMUM_LIQUIDITY;

                MintToken(UInt160.Zero, MINIMUM_LIQUIDITY);// permanently lock the first MINIMUM_LIQUIDITY tokens,
            }
            else
            {
                var liquidity0 = amount0 * totalSupply / reserve0;
                var liquidity1 = amount1 * totalSupply / reserve1;
                liquidity = liquidity0 > liquidity1 ? liquidity1 : liquidity0;
            }

            Assert(liquidity > 0, "Insufficient LP Minted");
            MintToken(toAddress, liquidity);

            Update(balance0, balance1, r);

            Minted(caller, amount0, amount1, liquidity);

            EnteredStorage.Put(0);
            return liquidity;
        }

        public static object Burn(UInt160 toAddress)
        {
            Assert(EnteredStorage.Get() == 0, "Re-entered");
            EnteredStorage.Put(1);
            Assert(toAddress.IsAddress(), "Invalid To-Address");

            var caller = Runtime.CallingScriptHash; //msg.sender
            Assert(CheckIsRouter(caller), "Only Router Can Burn");


            var me = Runtime.ExecutingScriptHash;
            var r = ReservePair;

            var balance0 = DynamicBalanceOf(Token0, me);
            var balance1 = DynamicBalanceOf(Token1, me);
            var liquidity = BalanceOf(me);

            var totalSupply = TotalSupply();
            var amount0 = liquidity * balance0 / totalSupply;
            var amount1 = liquidity * balance1 / totalSupply;

            Assert(amount0 > 0 && amount1 > 0, "Insufficient LP Burned");
            BurnToken(me, liquidity);

            SafeTransfer(Token0, me, toAddress, amount0);
            SafeTransfer(Token1, me, toAddress, amount1);

            balance0 = DynamicBalanceOf(Token0, me);
            balance1 = DynamicBalanceOf(Token1, me);

            Update(balance0, balance1, r);

            Burned(caller, liquidity, amount0, amount1, toAddress);

            EnteredStorage.Put(0);
            return new BigInteger[]
            {
                amount0,
                amount1,
            };
        }

        private static void MintToken(UInt160 toAddress, BigInteger amount)
        {
            AssetStorage.Increase(toAddress, amount);
            TotalSupplyStorage.Increase(amount);
            onTransfer(null, toAddress, amount);
        }

        private static void BurnToken(UInt160 fromAddress, BigInteger amount)
        {
            AssetStorage.Reduce(fromAddress, amount);
            TotalSupplyStorage.Reduce(amount);
            onTransfer(fromAddress, null, amount);
        }

        private static void Update(BigInteger balance0, BigInteger balance1, ReservesData reserve)
        {
            BigInteger blockTimestamp = Runtime.Time / 1000 % 4294967296;
            var priceCumulative = Cumulative;
            BigInteger timeElapsed = blockTimestamp - Cumulative.BlockTimestampLast;
            if (timeElapsed > 0 && reserve.Reserve0 != 0 && reserve.Reserve1 != 0)
            {
                priceCumulative.Price0CumulativeLast += reserve.Reserve1 * FIXED * timeElapsed / reserve.Reserve0;
                priceCumulative.Price1CumulativeLast += reserve.Reserve0 * FIXED * timeElapsed / reserve.Reserve1;
                priceCumulative.BlockTimestampLast = blockTimestamp;
                Cumulative = priceCumulative;
            }
            reserve.Reserve0 = balance0;
            reserve.Reserve1 = balance1;

            ReservePair = reserve;
            Synced(balance0, balance1);
        }
    }
}
