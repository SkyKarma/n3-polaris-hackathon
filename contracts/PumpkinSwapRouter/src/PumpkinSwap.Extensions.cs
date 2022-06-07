using System;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapRouter
{
    public static class PumpkinExtensions
    {

        public static BigInteger DynamicMint(this UInt160 pairContract, UInt160 toAddress)
        {
            return (BigInteger)Contract.Call(pairContract, "mint", CallFlags.All, new object[] { toAddress });
        }

        public static BigInteger[] DynamicBurn(this UInt160 pairContract, UInt160 toAddress)
        {
            return (BigInteger[])Contract.Call(pairContract, "burn", CallFlags.All, new object[] { toAddress });

        }

        [OpCode(OpCode.PUSHDATA1, "0100")]
        [OpCode(OpCode.CAT)]
        [OpCode(OpCode.CONVERT, "21")]
        public static extern BigInteger ToUInteger(this UInt160 val);

        [OpCode(OpCode.PUSH0)]
        [OpCode(OpCode.ADD)]
        public static extern BigInteger ToBigInt(this object val);

    }
}
