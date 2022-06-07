using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace PumpkinSwapFactory
{
    public partial class PumpkinSwapFactory
    {
        private static Transaction Tx => (Transaction) Runtime.ScriptContainer;
        
        private static void Assert(bool condition, string message)
        {
            if (!condition)
            {
                onFault(message);
                ExecutionEngine.Assert(false);
            }
        }

        private static void Assert(bool condition, string message, object data = null)
        {
            if (!condition)
            {
                onFault(message, data);
                ExecutionEngine.Assert(false);
            }
        }



        [OpCode(OpCode.APPEND)]
        private static extern void Append<T>(T[] array, T newItem);


        private static Iterator StorageFind(byte[] prefix) => Storage.Find(Storage.CurrentContext, prefix, FindOptions.RemovePrefix);

        private static ByteString StorageGet(byte[] key) => Storage.Get(Storage.CurrentContext, key);

        private static void StoragePut(ByteString key, ByteString value) => Storage.Put(Storage.CurrentContext, key, value);

        private static void StoragePut(byte[] key, ByteString value) => Storage.Put(Storage.CurrentContext, key, value);

        private static void StorageDelete(byte[] key) => Storage.Delete(Storage.CurrentContext, (ByteString)key);
    }
}
