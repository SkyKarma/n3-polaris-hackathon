using System.ComponentModel;

namespace PumpkinSwapRouter
{
    partial class PumpkinSwapRouterContract
    {
        [DisplayName("Fault")]
        public static event FaultEvent onFault;
        public delegate void FaultEvent(string message, params object[] paras);

    }
}
