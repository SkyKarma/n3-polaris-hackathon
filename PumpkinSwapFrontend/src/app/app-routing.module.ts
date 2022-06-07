import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeployComponent } from './deploy/deploy.component';
import { TokenContractComponent } from './deploy/token-contract/token-contract.component';
import { AddLiquidityComponent } from './pool/add-liquidity/add-liquidity.component';
import { AllPoolsComponent } from './pool/all-pools/all-pools.component';
import { CreateComponent } from './pool/create/create.component';
import { PoolComponent } from './pool/pool.component';
import { RemoveLiquidityComponent } from './pool/remove-liquidity/remove-liquidity.component';
import { ViewPoolComponent } from './pool/view-pool/view-pool.component';
import { StakingComponent } from './staking/staking.component';
import { SwapComponent } from './swap/swap.component';
import { LiquidityEarningsComponent } from './utility/liquidity-earnings/liquidity-earnings.component';
import { LockLiquidityComponent } from './utility/lock-liquidity/lock-liquidity.component';

const routes: Routes = [
    { path: '', component: SwapComponent },
    { path: 'pool', component: PoolComponent },
    { path: 'pool/add-liquidity', component: AddLiquidityComponent },
    { path: 'pool/add-liquidity/:tokenA/:tokenB', component: AddLiquidityComponent },
    { path: 'pool/remove-liquidity/:pool', component: RemoveLiquidityComponent },
    { path: 'pool/create', component: CreateComponent },
    { path: 'pool/create/:tokenA', component: CreateComponent },
    { path: 'pool/all', component: AllPoolsComponent },
    { path: 'pool/view/:address', component: ViewPoolComponent },
    { path: 'utility', component: DeployComponent },
    { path: 'utility/nep17', component: TokenContractComponent },
    { path: 'utility/lock-liquidity', component: LockLiquidityComponent },
    { path: 'utility/liquidity-earning', component: LiquidityEarningsComponent },
    { path: 'staking', component: StakingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
