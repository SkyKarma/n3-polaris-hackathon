using Neo;

namespace PumpkinSwapFactory
{
    public struct ExchangePair
    {
        public UInt160 TokenA;
        public UInt160 TokenB;
        public UInt160 ExchangePairHash;
    }
    
    public struct ReadableExchangePair
    {
        public string TokenA;
        public string TokenB;
        public string ExchangePairHash;
    }

    public struct KeyValue
    {
        public byte[] Key;
        public UInt160 Value;
    }

}
