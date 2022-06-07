using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;

namespace PumpkinSwapPair
{
    public static class PumpkinSwapExtensions
    {
        [OpCode(OpCode.PUSHDATA1, "0100")]
        [OpCode(OpCode.CAT)]
        [OpCode(OpCode.CONVERT, "21")]
        public static extern BigInteger ToUInteger(this UInt160 val);

        public static bool IsAddress(this UInt160 address)
        {
            return address.IsValid && !address.IsZero;
        }
    }
}
