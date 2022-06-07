using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapFactory
{
    public partial class PumpkinSwapFactory
    {
        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                AdminStorageMap.Put(AdminKey, (ByteString) Tx.Sender);
                AdminStorageMap.Put("DeployFee", 1000);
            }
        }
        
        private static StorageMap AdminStorageMap => new StorageMap(Storage.CurrentContext, "PumpkinSwapFactoryAdmin");
        const string AdminKey = "adminKey";
        const string RouterKey = "routerKey";

        public static UInt160 GetRouter() => (UInt160)AdminStorageMap.Get(RouterKey);
        public static UInt160 GetAdmin() => (UInt160)AdminStorageMap.Get(AdminKey);

        public static bool SetAdmin(UInt160 admin)
        {
            Assert(admin.IsAddress(), "Invalid Address");
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put(AdminKey, admin);

            return true;
        }

        public static bool SetRouter(UInt160 router)
        {
            Assert(router.IsAddress(), "Invalid Address");
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put(RouterKey, router);
            
            return true;
        }

        public static void Update(ByteString nefFile, string manifest)
        {
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            ContractManagement.Update(nefFile, manifest, null);
        }

        [Safe]
        public static BigInteger GetDeployFee() => (BigInteger)AdminStorageMap.Get("DeployFee");

        public static void SetDeployFee(BigInteger amount)
        {
            Assert(Runtime.CheckWitness(GetAdmin()), "Forbidden");
            AdminStorageMap.Put("DeployFee", amount);
        }
    }
}
