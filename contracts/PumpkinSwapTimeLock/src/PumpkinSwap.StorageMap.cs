using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapTimeLock
{
    public partial class PumpkinSwapTimeLockContract
    {
        private static StorageMap ContractMetadata => new StorageMap(Storage.CurrentContext, "Metadata");

        const string TotalKey = "TKey";

        private static StorageMap ContractLiquidityLockAsset => new StorageMap(Storage.CurrentContext, 0x01);
        private static StorageMap UserLockAsset => new StorageMap(Storage.CurrentContext, 0x02);
    }
}