import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/interface/token/token.service';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-active-pools',
  templateUrl: './active-pools.component.html',
  styleUrls: ['./active-pools.component.scss']
})
export class ActivePoolsComponent implements OnInit {

  loading: boolean = false;

  pools: 
  { 
    contract: string, 
    symbol: string, 
    amount: string, 
    tokenA: string,
    tokenAAmount: number,
    tokenASymbol: string,
    tokenB: string,
    tokenBAmount: number,
    tokenBSymbol: string,
    reserves: { address: string, reserve: string, scriptHash: string, token: string }[],
    totalSupply: number,
    sharesOfPool: number
  }[] = [];

  

  constructor(public walletProvider: WalletProviderService,
    private tokenService: TokenService) { }

  ngOnInit(): void {
    this.walletProvider.walletInitialized.subscribe(initialised =>
      {
        if(initialised)
        {
          this.pools = [];
          this.loading = true;
          this.walletProvider
            .Wallet()
            .getLiquidity()
            .then(async e => 
              {
                await Promise.all(e.map(async (element) => 
                {
                  this.pools.push({
                    contract: element.contract,
                    symbol: element.symbol,
                    amount: element.amount,
                    tokenA: element.tokenA,
                    tokenAAmount: undefined,
                    tokenASymbol: undefined,
                    tokenB: element.tokenB,
                    tokenBAmount: undefined,
                    tokenBSymbol: undefined,
                    reserves: [],
                    totalSupply: undefined,
                    sharesOfPool: undefined
                  });
                }))
              })
              .then(async () => 
              {
                await Promise.all(this.pools.map(async (pool) =>
                {
                  return this.walletProvider
                    .Wallet()
                    .getTotalSupply(pool.contract)
                    .then(amount =>
                      {
                        pool.totalSupply = this.getTotalSupplyWithDecimals(amount, 8);
                        pool.sharesOfPool = parseFloat(((parseFloat(pool.amount) / pool.totalSupply) * 100).toFixed(3));
                      });
                }));
              })
              .then(async () => 
              {
                await Promise.all(this.pools.map(async (pool) =>
                {
                  return this.walletProvider
                      .Wallet()
                      .getReserves(pool.contract)
                      .then(reserve => 
                        {
                          reserve.forEach(reserve =>
                            {
                              this.tokenService
                                .getToken(reserve.scriptHash)
                                .then(result =>
                                  {
                                    if(reserve.token === "token0")
                                    {
                                      pool.tokenAAmount = parseFloat(((parseFloat(pool.amount) * this.getTotalSupplyWithDecimals(reserve.reserve, result.decimals)) / pool.totalSupply).toFixed(4));
                                      pool.tokenASymbol = result.symbol;
                                    }
                                    else
                                    {
                                      pool.tokenBAmount = parseFloat(((parseFloat(pool.amount) * this.getTotalSupplyWithDecimals(reserve.reserve, result.decimals)) / pool.totalSupply).toFixed(4));
                                      pool.tokenBSymbol = result.symbol;
                                    }
                                  });
                            })
                          pool.reserves = reserve;
                        });
                }));
              })
              .finally(() => this.loading = false);
        }
      })
  }

  private getTotalSupplyWithDecimals(num: string, decimals: number) : number
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return Number(parseFloat(num) / parseFloat(final));
  }
}
