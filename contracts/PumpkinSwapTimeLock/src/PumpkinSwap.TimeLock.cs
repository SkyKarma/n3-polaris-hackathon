using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapTimeLock
{
    [DisplayName("PTimeLock")]
    [ContractPermission("*", new[] {"*"})]
    public partial class PumpkinSwapTimeLockContract : SmartContract
    {
        private static Transaction Tx => (Transaction) Runtime.ScriptContainer;

        public static void LockLiquidity(UInt160 sender, UInt160 liquidity, BigInteger amount, BigInteger endDate)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            Assert((BigInteger)Runtime.Time <= endDate, "Wrong enddate");

            SafeTransfer(liquidity, sender, Runtime.ExecutingScriptHash, amount);

            TimeLock timeLock = new TimeLock();

            timeLock.Amount = amount;
            timeLock.EndDate = endDate;
            timeLock.Sender = sender;
            timeLock.Liquidity = liquidity;
            timeLock.LiquidityCounter = GetContractLiquidityCounter(liquidity) + 1;

            BigInteger userCounter = GetUserCounter(sender) + 1;

            UserLockAsset.Put(sender + userCounter, StdLib.Serialize(timeLock));
            ContractLiquidityLockAsset.Put(liquidity + timeLock.LiquidityCounter, StdLib.Serialize(timeLock));

            UpdateUserCounter(sender, userCounter);
            UpdateContractLiquidityCounter(liquidity, timeLock.LiquidityCounter);
            
            OnLiquidityLocked(sender, liquidity, endDate, amount);
        }

        private static BigInteger GetUserCounter(UInt160 sender) => (BigInteger)UserLockAsset.Get(sender + TotalKey);
        private static BigInteger GetContractLiquidityCounter(UInt160 liquidity) => (BigInteger)ContractLiquidityLockAsset.Get(liquidity + TotalKey);

        private static void UpdateUserCounter(UInt160 sender, BigInteger counter) => UserLockAsset.Put(sender + TotalKey, counter);
        private static void UpdateContractLiquidityCounter(UInt160 liquidity, BigInteger counter) => ContractLiquidityLockAsset.Put(liquidity + TotalKey, counter);

        public static bool UnlockLiquidity(UInt160 sender, UInt160 liquidity, BigInteger counter)
        {
            Assert(Runtime.CheckWitness(sender), "Forbidden");
            
            var timeLockAsset = (TimeLock)UserLockAsset.GetObject(sender + counter);
            Assert(timeLockAsset != null, "Does not exist");
            Assert(timeLockAsset.Amount > 0, "0 amount");

            var liquidityLockAsset = (TimeLock)ContractLiquidityLockAsset.GetObject(liquidity + timeLockAsset.LiquidityCounter);
            Assert(liquidityLockAsset != null, "Does not exist");
            Assert(liquidityLockAsset.Amount > 0, "0 amount");

            SafeTransfer(liquidity, Runtime.ExecutingScriptHash, sender, timeLockAsset.Amount);

            OnLiquidityUnlocked(sender, liquidity, timeLockAsset.Amount);

            timeLockAsset.Amount = 0;
            liquidityLockAsset.Amount = 0;

            UserLockAsset.PutObject(sender + counter, timeLockAsset);
            ContractLiquidityLockAsset.PutObject(liquidity + timeLockAsset.LiquidityCounter, liquidityLockAsset);

            return true;
        }

        public List<ReadableTimeLock> GetAllLocksForAddress(UInt160 address)
        {
            List<ReadableTimeLock> list = new List<ReadableTimeLock>();
            BigInteger userCounter = GetUserCounter(address);

            if(userCounter == 0)
            {
                return list;
            }

            for (int i = 1; i < userCounter + 1; i++) 
            {
                var record = UserLockAsset.Get(address + i);
                if(record != null)
                {
                    TimeLock lockAsset = (TimeLock)StdLib.Deserialize(record);
                    var timeLock = new ReadableTimeLock();
                    timeLock.SetAmount(lockAsset.Amount);
                    timeLock.SetEndDate(lockAsset.EndDate);
                    timeLock.SetLp(lockAsset.Liquidity.ToAddress(53));
                    timeLock.SetSender(address.ToAddress(53));
                    timeLock.SetCounter(i);
                    
                    list.Add(timeLock);
                }
            }
            return list;
        }

        public List<ReadableTimeLock> GetAllLocksForContract(UInt160 address)
        {
            List<ReadableTimeLock> list = new List<ReadableTimeLock>();
            BigInteger contractCounter = GetContractLiquidityCounter(address);

            if(contractCounter == 0)
            {
                return list;
            }

            for (int i = 1; i < contractCounter + 1; i++) 
            {
                var record = ContractLiquidityLockAsset.Get(address + i);
                if(record != null)
                {
                    TimeLock lockAsset = (TimeLock)StdLib.Deserialize(record);
                    var timeLock = new ReadableTimeLock();
                    timeLock.SetAmount(lockAsset.Amount);
                    timeLock.SetEndDate(lockAsset.EndDate);
                    timeLock.SetLp(address.ToAddress(53));
                    timeLock.SetSender(lockAsset.Sender.ToAddress(53));
                    timeLock.SetCounter(i);
                    
                    list.Add(timeLock);
                }
            }
            return list;
        }

        public static void OnNEP17Payment(UInt160 from, BigInteger amount, object[] data)
        {
        }
    }
}