using System.ComponentModel;
using System.Numerics;
using Neo;

namespace PumpkinSwapNepDeployer
{
    public partial class PumpkinSwapNepDeployer
    {
        public delegate void OnDeployTokenContractDelegate(UInt160 from, string contractName, UInt160 contactHash, string contractAddress);
        [DisplayName("DeployTokenContract")]
        public static event OnDeployTokenContractDelegate OnDeployTokenContract;
    }
}