using System;
using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinToken
{
    [SupportedStandards("NEP-17")]
    [ContractPermission("*", new[] {"*"})]
    public class PumpkinToken : Nep17Token
    {
        private static StorageMap ContractStorage => new StorageMap(Storage.CurrentContext, "DefaultContract");
        private static StorageMap ContractMetadata => new StorageMap(Storage.CurrentContext, "Metadata");

        private static Transaction Tx => (Transaction) Runtime.ScriptContainer;

        [DisplayName("_deploy")]
        public static void Deploy(object data, bool update)
        {
            if (!update)
            {
                ContractMetadata.Put("Owner", (ByteString) Tx.Sender);
                ContractMetadata.Put("Init", 0);
            }
        }

        public static void Update(ByteString nefFile, string manifest)
        {
            VerifyOwner();
            ContractManagement.Update(nefFile, manifest, null);
        }

        private static void VerifyOwner()
        {
            ByteString owner = ContractMetadata.Get("Owner");

            if (!Runtime.CheckWitness(Tx.Sender))
            {
                throw new Exception("Only the contract owner can do this");
            }
        }

        public static void Initialise(UInt160 owner, Byte decimals, string symbol, BigInteger totalSupply)
        {
            BigInteger initialised = (BigInteger)ContractMetadata.Get("Init");
            if(initialised == 0)
            {
                ContractMetadata.Put("Owner", (ByteString) owner);
                ContractMetadata.Put("Decimals", decimals);
                ContractMetadata.Put("Symbol", symbol);
                Mint(owner, totalSupply);
                
                ContractMetadata.Put("Init", 1);
            }
        }

        public override byte Decimals() => ((Byte)(BigInteger)ContractMetadata.Get("Decimals"));

        public override string Symbol() => (string)ContractMetadata.Get("Symbol");

        public static void Burn(BigInteger amount)
        {
            if (amount < 0)
                throw new Exception("The amount must be a positive number.");
            if (!Runtime.CheckWitness(Tx.Sender)) return;
            if (BalanceOf(Tx.Sender) < amount) return;
            if (amount == 0) return;
            Nep17Token.Burn(Tx.Sender, amount);
        }
    }
}
