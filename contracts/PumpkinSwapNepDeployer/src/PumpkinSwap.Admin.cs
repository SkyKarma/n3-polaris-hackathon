
using System;
using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapNepDeployer
{
    public partial class PumpkinSwapNepDeployer
    {
        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                ContractMetadata
                .Put("Owner", (ByteString) Tx.Sender);
                ContractMetadata.Put("DeployFee", 10000);
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

        [Safe]
        public static BigInteger GetDeployFee() => (BigInteger)ContractMetadata.Get("DeployFee");

        public static void SetDeployFee(BigInteger amount)
        {
            VerifyOwner();
            ContractMetadata.Put("DeployFee", amount);
        }

        private static void VerifyOwner()
        {
            ByteString owner = ContractMetadata.Get("Owner");
            if(!Runtime.CheckWitness((UInt160)owner))
            {
                throw new Exception("Only the contract owner can do this");
            }
            
            if (!Tx.Sender.Equals(owner))
            {
                throw new Exception("Only the contract owner can do this");
            }
        }
    }
}

