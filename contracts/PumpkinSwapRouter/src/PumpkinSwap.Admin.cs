using System.ComponentModel;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;
using Neo.SmartContract.Framework.Native;

namespace PumpkinSwapRouter
{
    public partial class PumpkinSwapRouterContract
    {
        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                AdminStorageMap.Put(AdminKey, (ByteString) Tx.Sender);
            }
        }

        private static StorageMap AdminStorageMap => new StorageMap(Storage.CurrentContext, "PumpkinSwapFactoryAdmin");
        const string AdminKey = "adminKey";
        const string FactoryKey = "factoryKey";

        public static UInt160 GetFactory() => (UInt160)AdminStorageMap.Get(FactoryKey);
        public static UInt160 GetAdmin() => (UInt160)AdminStorageMap.Get(AdminKey);

        public static bool Verify() => Runtime.CheckWitness(GetAdmin());
        
        public static bool SetAdmin(UInt160 admin)
        {
            Assert(admin.IsValid && !admin.IsZero, "Invalid Address");
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put(AdminKey, admin);
            return true;
        }

        public static bool SetFactory(UInt160 factory)
        {
            Assert(factory.IsValid && !factory.IsZero, "Invalid Address");
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put(FactoryKey, factory);
            return true;
        }

        public static void Update(ByteString nefFile, string manifest)
        {
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            ContractManagement.Update(nefFile, manifest, null);
        }
    }
}
