using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapPair
{
    public partial class PumpkinSwapPair
    {
        private static Transaction Tx => (Transaction) Runtime.ScriptContainer;
        private static void Assert(bool condition, string message)
        {
            if (!condition)
            {
                onFault(message, null);
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

        private static bool CheckIsRouter(UInt160 address) => address.Equals(GetRouter());
    }
}