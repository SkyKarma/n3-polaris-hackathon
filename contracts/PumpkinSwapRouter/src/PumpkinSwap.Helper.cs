using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapRouter
{
    public partial class PumpkinSwapRouterContract
    {
        private static Transaction Tx => (Transaction) Runtime.ScriptContainer;
        
        private static void Assert(bool condition, string message)
        {
            if (!condition)
            {
                onFault(message);
                ExecutionEngine.Assert(false);
            }
        }

        private static void Assert(bool condition, string message, params object[] data)
        {
            if (!condition)
            {
                onFault(message, data);
                ExecutionEngine.Assert(false);
            }
        }

        public static UInt160 GetExchangePairWithAssert(UInt160 tokenA, UInt160 tokenB)
        {
            Assert(tokenA.IsValid && tokenB.IsValid, "Invalid A or B Address");
            var pairContract = (byte[])Contract.Call(GetFactory(), "getExchangePair", CallFlags.ReadOnly, new object[] { tokenA, tokenB });
            Assert(pairContract != null && pairContract.Length == 20, "PairContract Not Found", tokenA, tokenB);
            return (UInt160)pairContract;
        }

        private static void SafeTransfer(UInt160 token, UInt160 from, UInt160 to, BigInteger amount)
        {
            var result = (bool)Contract.Call(token, "transfer", CallFlags.All, new object[] { from, to, amount, null });
            Assert(result, "Transfer Fail", token);
        }


        private static ByteString StorageGet(string key) => Storage.Get(Storage.CurrentContext, key);

        private static void StoragePut(string key, string value) => Storage.Put(Storage.CurrentContext, key, value);

        private static void StoragePut(string key, byte[] value) => Storage.Put(Storage.CurrentContext, key, (ByteString)value);

        private static void StoragePut(byte[] key, byte[] value) => Storage.Put(Storage.CurrentContext, key, (ByteString)value);

        private static void StoragePut(string key, ByteString value) => Storage.Put(Storage.CurrentContext, key, value);
    }
}
