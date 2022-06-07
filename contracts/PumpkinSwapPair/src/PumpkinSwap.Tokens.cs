using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        private static StorageMap TokenStorageMap => new StorageMap(Storage.CurrentContext, "CookieToken");
        
        static UInt160 Token0
        {
            get => (UInt160)TokenStorageMap.Get("token0");
            set => TokenStorageMap.Put("token0", value);
        }

        static UInt160 Token1
        {
            get => (UInt160)TokenStorageMap.Get("token1");
            set => TokenStorageMap.Put("token1", value);
        }

        [Safe]
        public static UInt160 GetToken0() => Token0;
        [Safe]
        public static string GetReadableToken0() => Token0.ToAddress(53);

        [Safe]
        public static UInt160 GetToken1() => Token1;
        [Safe]
        public static string GetReadableToken1() => Token1.ToAddress(53);
    }
}