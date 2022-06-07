using System.ComponentModel;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapTimeLock
{
    public partial class PumpkinSwapTimeLockContract
    {
        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                ContractMetadata.Put("Owner", (ByteString) Tx.Sender);
            }
        }

        public static void Update(ByteString nefFile, string manifest)
        {
            VerifyOwner();
            ContractManagement.Update(nefFile, manifest, null);
        }

        public static bool Destroy() 
        {
            VerifyOwner();
            ContractManagement.Destroy();
            return true;
        }

        private static void VerifyOwner()
        {
            ByteString owner = ContractMetadata.Get("Owner");
            Assert(Runtime.CheckWitness(Tx.Sender), "Forbidden");
            Assert(Tx.Sender.Equals(owner), "Forbidden");
        }
    }
}