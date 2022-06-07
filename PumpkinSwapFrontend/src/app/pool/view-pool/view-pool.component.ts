import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/services/interface/token/token.service';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-view-pool',
  templateUrl: './view-pool.component.html',
  styleUrls: ['./view-pool.component.scss']
})
export class ViewPoolComponent implements OnInit {
  doughnutChartData: any[] = [];

  loading: boolean = true;

  address: string = "";

  locks: 
  {
    ownerShortened: string, 
    owner: string, 
    contract: string, 
    endDate: number, 
    amount: number, 
    counter: number 
  }[] = [];

  totalAmountLocked: number = 0;
  totalAmountLockedDisplay: number = 0;
  totalTokenAAmountLocked: string = undefined;
  totalTokenBAmountLocked: string = undefined;

  token: 
  { 
    tokenASymbol: string,
    tokenBSymbol: string,
    symbol: string, 
    scriptHash: string, 
    decimals: number,
    totalSupply: number,
    totalSupplyDisplay: number,
    reserves: { address: string, reserve: string, scriptHash: string, token: string }[],
    tokenA: {symbol: string, scriptHash: string, decimals: number},
    tokenB: {symbol: string, scriptHash: string, decimals: number},
    tokenATotal: number,
    tokenATotalDisplay: string,
    tokenBTotal: number,
    tokenBTotalDisplay: string,
  };

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private walletProvider: WalletProviderService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.address = params.get('address');
    });

    this.walletProvider.walletInitialized.subscribe(initialised =>
      {
        if(initialised)
        {
          this.tokenService
            .getToken(this.address)
            .then(t => 
              {
                if(t.symbol.startsWith("PLP"))
                {
                  var symbolSplitted = t.symbol.split('-');
                  this.token = {
                    tokenBSymbol: symbolSplitted.pop(),
                    tokenASymbol: symbolSplitted.pop(),
                    symbol: t.symbol,
                    scriptHash: t.scriptHash,
                    decimals: t.decimals,
                    totalSupply: undefined,
                    totalSupplyDisplay: undefined,
                    reserves: undefined,
                    tokenA: undefined,
                    tokenATotal: undefined,
                    tokenATotalDisplay: undefined,
                    tokenB: undefined,
                    tokenBTotal: undefined,
                    tokenBTotalDisplay: undefined
                  }
                }
              })
              .then(async () =>
              {
                await this.walletProvider
                  .Wallet()
                  .getTotalSupply(this.token.scriptHash)
                  .then(supply => 
                    {
                      this.token.totalSupply = supply;
                      this.token.totalSupplyDisplay = parseFloat(this.getTotalSupplyWithDecimals(supply, this.token.decimals).toFixed(1));
                    })
              })
              .then(async () =>
              {
                await this.walletProvider
                  .Wallet()
                  .getReserves(this.token.scriptHash)
                  .then(reserves => 
                    {
                      this.token.reserves = reserves;
                    })
              })
              .then(async () =>
              {
                await Promise.all(this.token.reserves.map(async (element) =>
                {
                  await this.tokenService
                  .getToken(element.scriptHash)
                  .then(t => {
                    if (element.token === "token0") {
                      this.token.tokenA = t;
                      this.token.tokenATotal = parseFloat(element.reserve);
                      this.token.tokenATotalDisplay = this.getTotalSupplyWithDecimals(element.reserve, this.token.tokenA.decimals).toFixed(1)
                    }
                    else {
                      this.token.tokenB = t;
                      this.token.tokenBTotal = parseFloat(element.reserve);
                      this.token.tokenBTotalDisplay = this.getTotalSupplyWithDecimals(element.reserve, this.token.tokenB.decimals).toFixed(1)
                    }
                  });
                }));
              })
              .then(async () =>
              {
                await this.walletProvider
                  .Wallet()
                  .getAllLocksForContract(this.token.scriptHash)
                  .then(async result => 
                    {
                      // this.locks = result;

                      await Promise.all(result.map(async (element) =>
                      {
                        if(element.amount > 0)
                        {
                          this.totalAmountLocked = this.totalAmountLocked + parseFloat(element.amount.toString());
                          this.locks.push(
                            {
                              ownerShortened: element.owner.substring(0, 3) + "..." + element.owner.substring(element.owner.length - 3),
                              amount: this.getTotalSupplyWithDecimals(element.amount.toString(), 8),
                              contract: element.contract,
                              counter: element.counter,
                              endDate: this.diffDays(new Date(element.endDate)),
                              owner: element.owner
                            }
                          );
                        }
                      }))

                      this.totalAmountLockedDisplay = this.getTotalSupplyWithDecimals(this.totalAmountLocked.toString(), 8);

                      this.doughnutChartData = [[this.totalAmountLockedDisplay, (this.token.totalSupplyDisplay - this.totalAmountLockedDisplay)]];

                      this.totalTokenAAmountLocked = this.getTotalSupplyWithDecimals(((this.token.tokenATotal / this.token.totalSupply) * this.totalAmountLocked).toString(), this.token.tokenA.decimals).toFixed(1);
                      this.totalTokenBAmountLocked = this.getTotalSupplyWithDecimals(((this.token.tokenBTotal / this.token.totalSupply) * this.totalAmountLocked).toString(), this.token.tokenB.decimals).toFixed(1);
                    });
              })
            .finally(() => this.loading = false)
        }
      });
  }

  private diffDays(endDate: Date)
  {
    var now = new Date;
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
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