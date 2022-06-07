using System.ComponentModel;
using Neo;

namespace PumpkinSwapFactory
{
    partial class PumpkinSwapFactory
    {
        [DisplayName("CreateExchange")]
        public static event CreateExchangeEvent onCreateExchange;
        public delegate void CreateExchangeEvent(UInt160 tokenA, UInt160 tokenB, UInt160 exchangeContractHash);

        [DisplayName("Fault")]
        public static event FaultEvent onFault;
        public delegate void FaultEvent(string message, params object[] paras);

    }
}
