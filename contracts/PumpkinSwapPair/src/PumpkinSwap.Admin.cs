using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        const string SymbolKey = "symbolKey";
        const string AdminKey = "adminKey";
        const string RouterKey = "routerKey";
        const string InitialisedKey = "initKey";
        
        private static void SetSymbol(string symbol) => AdminStorageMap.Put(SymbolKey, symbol);
        private static StorageMap AdminStorageMap => new StorageMap(Storage.CurrentContext, "PumpkinSwapPairAdmin");
        public static string Symbol() => AdminStorageMap.Get(SymbolKey);

        public static UInt160 GetRouter() => (UInt160)AdminStorageMap.Get(RouterKey);

        public static UInt160 GetAdmin() => (UInt160)AdminStorageMap.Get(AdminKey);

        private static bool IsInitialised() => false;

        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                AdminStorageMap.Put(AdminKey, (ByteString) Tx.Sender);
                AdminStorageMap.Put(InitialisedKey, 0);
            }
        }

        public static void InitalisePair(string symbol, UInt160 Router, UInt160 tokenA, UInt160 tokenB)
        {
            BigInteger initialised = (BigInteger)AdminStorageMap.Get(InitialisedKey);

            Assert(initialised == 0, "Forbidden");
            AdminStorageMap.Put(SymbolKey, symbol);
            AdminStorageMap.Put(RouterKey, (ByteString) Router);
            
            if (tokenA.ToUInteger() < tokenB.ToUInteger())
            {
                Token0 = tokenA;
                Token1 = tokenB;
            }
            else
            {
                Token0 = tokenB;
                Token1 = tokenA;
            }
            Deployed(Token0, Token1);
            AdminStorageMap.Put(InitialisedKey, 1);
        }

        public static bool SetAdmin(UInt160 admin)
        {
            Assert(admin.IsAddress(), "Invalid Address");
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put(AdminKey, admin);
            return true;
        }

        public static void Update(ByteString nefFile, string manifest)
        {
            Assert(Runtime.CheckWitness(GetAdmin()), "No authorization.");
            Assert(Tx.Sender.Equals(GetAdmin()), "Only the contract owner can do this");
            ContractManagement.Update(nefFile, manifest, null);
        }    
    }
}
