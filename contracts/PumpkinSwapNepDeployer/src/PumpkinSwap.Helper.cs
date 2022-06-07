using System.ComponentModel;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapNepDeployer
{
    public partial class PumpkinSwapNepDeployer
    {
        [DisplayName("Fault")]
        public static event FaultEvent onFault;
        public delegate void FaultEvent(string message, params object[] paras);

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

        private static void SafeTransfer(UInt160 token, UInt160 from, UInt160 to, BigInteger amount)
        {
            var result = (bool)Contract.Call(token, "transfer", CallFlags.All, new object[] { from, to, amount, null });
            Assert(result, "Transfer Fail", token);
        }

        [OpCode(OpCode.APPEND)]
        private static extern void Append<T>(T[] array, T newItem);
    }
}

