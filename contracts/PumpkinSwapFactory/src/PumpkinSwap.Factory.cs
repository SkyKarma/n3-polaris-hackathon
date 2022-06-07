using System.ComponentModel;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;
using Neo.SmartContract.Framework.Native;

namespace PumpkinSwapFactory
{
    [DisplayName("PumpkinSwapFactory")]
    [ManifestExtra("Description", "Pumpkin factory")]
    [ContractPermission("*", new[] {"*"})]
    public partial class PumpkinSwapFactory : SmartContract
    {
        private static readonly byte[] ExchangeMapKey = new byte[] { 0xaa };

        public static ByteString GetExchangePair(UInt160 tokenA, UInt160 tokenB)
        {
            Assert(tokenA != tokenB, "Identical Address", tokenA);
            return StorageGet(GetPairKey(tokenA, tokenB));
        }

        public static string GetReadableExchangePair(UInt160 tokenA, UInt160 tokenB)
        {
            Assert(tokenA != tokenB, "Identical Address", tokenA);
            return ((UInt160)StorageGet(GetPairKey(tokenA, tokenB))).ToAddress(53);
        }

        private static void CreateExchangePair(string symbol, UInt160 tokenA, UInt160 tokenB, UInt160 exchangeContractHash)
        {
            Assert(tokenA.IsAddress() && tokenB.IsAddress(), "Invalid Address");
            Assert(tokenA != tokenB, "Identical Address", tokenA);
            var key = GetPairKey(tokenA, tokenB);
            var value = StorageGet(key);
            Assert(value == null || value.Length == 0, "Exchange Already Existed");

            StoragePut(key, exchangeContractHash);
            onCreateExchange(tokenA, tokenB, exchangeContractHash);
        }

        public static ExchangePair[] GetAllExchangePair()
        {
            var iterator = (Iterator<KeyValue>)StorageFind(ExchangeMapKey);
            var result = new ExchangePair[0];
            while (iterator.Next())
            {
                var keyValue = iterator.Value;
                if (keyValue.Value != null)
                {
                    var exchangeContractHash = keyValue.Value;
                    var tokenA = keyValue.Key.Take(20);
                    var tokenB = keyValue.Key.Last(20);
                    var item = new ExchangePair()
                    {
                        TokenA = (UInt160)tokenA,
                        TokenB = (UInt160)tokenB,
                        ExchangePairHash = exchangeContractHash,
                    };
                    Append(result, item);
                }
            }
            return result;
        }

        public static ReadableExchangePair[] GetAllReadableExchangePair()
        {
            var iterator = (Iterator<KeyValue>)StorageFind(ExchangeMapKey);
            var result = new ReadableExchangePair[0];
            while (iterator.Next())
            {
                var keyValue = iterator.Value;
                if (keyValue.Value != null)
                {
                    var exchangeContractHash = keyValue.Value;
                    var tokenA = keyValue.Key.Take(20);
                    var tokenB = keyValue.Key.Last(20);
                    var item = new ReadableExchangePair()
                    {
                        TokenA = ((UInt160)tokenA).ToAddress(53),
                        TokenB = ((UInt160)tokenB).ToAddress(53),
                        ExchangePairHash = exchangeContractHash.ToAddress(53),
                    };
                    Append(result, item);
                }
            }
            return result;
        }

        private static byte[] GetPairKey(UInt160 tokenA, UInt160 tokenB)
        {
            return tokenA.ToUInteger() < tokenB.ToUInteger()
                ? ExchangeMapKey.Concat(tokenA).Concat(tokenB)
                : ExchangeMapKey.Concat(tokenB).Concat(tokenA);
        }
    }
}
