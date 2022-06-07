using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapRouter
{
    [ManifestExtra("Description", "Pumpkin Router")]
    [ContractPermission("*", new[] {"*"})]
    public partial class PumpkinSwapRouterContract : SmartContract
    {
        public static BigInteger[] AddLiquidity(
            UInt160 sender, 
            UInt160 tokenA, 
            UInt160 tokenB,
            BigInteger amountADesired, 
            BigInteger amountBDesired, 
            BigInteger amountAMin, 
            BigInteger amountBMin, 
            BigInteger deadLine)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            Assert((BigInteger)Runtime.Time <= deadLine, "Exceeded the deadline");

            var reserves = GetReserves(tokenA, tokenB);
            var reserveA = reserves[0];
            var reserveB = reserves[1];
            BigInteger amountA = 0;
            BigInteger amountB = 0;
            if (reserveA == 0 && reserveB == 0)
            {
                amountA = amountADesired;
                amountB = amountBDesired;
            }
            else
            {
                var estimatedB = Quote(amountADesired, reserveA, reserveB);
                if (estimatedB <= amountBDesired)
                {
                    Assert(estimatedB >= amountBMin, "Insufficient B Amount");
                    amountA = amountADesired;
                    amountB = estimatedB;
                }
                else
                {
                    var estimatedA = Quote(amountBDesired, reserveB, reserveA);
                    Assert(estimatedA <= amountADesired, "Excess A Amount");
                    Assert(estimatedA >= amountAMin, "Insufficient A Amount");
                    amountA = estimatedA;
                    amountB = amountBDesired;
                }
            }
            var pairContract = GetExchangePairWithAssert(tokenA, tokenB);

            SafeTransfer(tokenA, sender, pairContract, amountA);
            SafeTransfer(tokenB, sender, pairContract, amountB);
            
            BigInteger liquidity = pairContract.DynamicMint(sender);
            return new BigInteger[] { amountA, amountB, liquidity };
        }

        public static BigInteger[] RemoveLiquidity(UInt160 sender, UInt160 tokenA, UInt160 tokenB, BigInteger liquidity, BigInteger amountAMin, BigInteger amountBMin, BigInteger deadLine)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            Assert((BigInteger)Runtime.Time <= deadLine, "Exceeded the deadline");

            var pairContract = GetExchangePairWithAssert(tokenA, tokenB);
            SafeTransfer(pairContract, sender, pairContract, liquidity);

            var amounts = pairContract.DynamicBurn(sender);
            var tokenAIsToken0 = tokenA.ToUInteger() < tokenB.ToUInteger();
            var amountA = tokenAIsToken0 ? amounts[0] : amounts[1];
            var amountB = tokenAIsToken0 ? amounts[1] : amounts[0];

            Assert(amountA >= amountAMin, "Insufficient A Amount");
            Assert(amountB >= amountBMin, "Insufficient B Amount");

            return new BigInteger[] { amountA, amountB };
        }

        public static BigInteger Quote(BigInteger amountA, BigInteger reserveA, BigInteger reserveB)
        {
            Assert(amountA > 0 && reserveA > 0 && reserveB > 0, "Amount|Reserve Invalid", amountA, reserveA, reserveB);
            var amountB = amountA * reserveB / reserveA;
            return amountB;
        }

        public static BigInteger GetAmountOut(BigInteger amountIn, BigInteger reserveIn, BigInteger reserveOut)
        {
            Assert(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "AmountIn Must > 0");

            var amountInWithFee = amountIn * 997;
            var numerator = amountInWithFee * reserveOut;
            var denominator = reserveIn * 1000 + amountInWithFee;

            return numerator / denominator;
        }

        public static BigInteger GetAmountIn(BigInteger amountOut, BigInteger reserveIn, BigInteger reserveOut)
        {
            Assert(amountOut > 0 && reserveIn > 0 && reserveOut > 0, "AmountOut Must > 0");
            var numerator = reserveIn * amountOut * 1000;
            var denominator = (reserveOut - amountOut) * 997;
            var amountIn = (numerator / denominator) + 1;
            return amountIn;
        }

        public static BigInteger[] GetAmountsOut(BigInteger amountIn, UInt160[] paths)
        {
            Assert(paths.Length >= 2, "INVALID_PATH");
            var amounts = new BigInteger[paths.Length];
            amounts[0] = amountIn;
            var max = paths.Length - 1;
            for (var i = 0; i < max; i++)
            {
                var nextIndex = i + 1;
                var data = GetReserves(paths[i], paths[nextIndex]);
                amounts[nextIndex] = GetAmountOut(amounts[i], data[0], data[1]);
            }
            return amounts;
        }

        public static BigInteger[] GetAmountsIn(BigInteger amountOut, UInt160[] paths)
        {
            Assert(paths.Length >= 2, "INVALID_PATH");
            var amounts = new BigInteger[paths.Length];
            var max = paths.Length - 1;
            amounts[max] = amountOut;
            for (var i = max; i > 0; i--)
            {
                var preIndex = i - 1;
                var data = GetReserves(paths[preIndex], paths[i]);
                amounts[preIndex] = GetAmountIn(amounts[i], data[0], data[1]);
            }
            return amounts;
        }

        public static BigInteger[] GetReserves(UInt160 tokenA, UInt160 tokenB)
        {
            var reserveData = (ReservesData)Contract.Call(GetExchangePairWithAssert(tokenA, tokenB), "getReserves", CallFlags.ReadOnly, new object[] { });
            return tokenA.ToUInteger() < tokenB.ToUInteger() ? new BigInteger[] { reserveData.Reserve0, reserveData.Reserve1 } : new BigInteger[] { reserveData.Reserve1, reserveData.Reserve0 };
        }

        public static bool SwapTokenInForTokenOut(UInt160 sender, BigInteger amountIn, BigInteger amountOutMin, UInt160[] paths, BigInteger deadLine)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            Assert((BigInteger)Runtime.Time <= deadLine, "Exceeded the deadline");

            var amounts = GetAmountsOut(amountIn, paths);
            Assert(amounts[amounts.Length - 1] >= amountOutMin, "Insufficient AmountOut");

            var pairContract = GetExchangePairWithAssert(paths[0], paths[1]);
            SafeTransfer(paths[0], sender, pairContract, amounts[0]);
            Swap(amounts, paths, sender);
            return true;
        }

        public static bool SwapTokenOutForTokenIn(UInt160 sender, BigInteger amountOut, BigInteger amountInMax, UInt160[] paths, BigInteger deadLine)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            Assert((BigInteger)Runtime.Time <= deadLine, "Exceeded the deadline");

            var amounts = GetAmountsIn(amountOut, paths);
            Assert(amounts[0] <= amountInMax, "Excessive AmountIn");

            var pairContract = GetExchangePairWithAssert(paths[0], paths[1]);
            SafeTransfer(paths[0], sender, pairContract, amounts[0]);
            Swap(amounts, paths, sender);
            return true;
        }

        private static void Swap(BigInteger[] amounts, UInt160[] paths, UInt160 toAddress)
        {
            var max = paths.Length - 1;
            for (int i = 0; i < max; i++)
            {
                var input = paths[i];
                var output = paths[i + 1];
                var amountOut = amounts[i + 1];

                BigInteger amount0Out = 0;
                BigInteger amount1Out = 0;
                if (input.ToUInteger() < output.ToUInteger())
                {
                    amount1Out = amountOut;
                }
                else
                {
                    amount0Out = amountOut;
                }

                var to = toAddress;
                if (i < paths.Length - 2)
                {
                    to = GetExchangePairWithAssert(output, paths[i + 2]);
                }

                var pairContract = GetExchangePairWithAssert(input, output);
                Contract.Call(pairContract, "swap", CallFlags.All, new object[] { amount0Out, amount1Out, to, null});
            }
        }
    }
}