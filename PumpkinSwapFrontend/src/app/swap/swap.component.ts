import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from '../services/interface/settings/settings.service';
import { TokenService } from '../services/interface/token/token.service';
import { TokenSelectDialogComponent } from '../dialog/token-select-dialog/token-select-dialog.component';
import { WalletProviderService } from '../wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  private allExchangePairs: {tokenA: string, tokenB: string, poolAddress: string}[] = [];
  private liquidityPathAddresses: any[] = [];
  lpPath: {symbol: string, scriptHash: string, decimals: number}[] = [];

  private liquidityPools: 
  {
    tokenA: string, 
    tokenB: string, 
    poolAddress: string, 
    hasLiquidity: boolean,
    reserves: 
      { 
        address: string, 
        reserve: string, 
        scriptHash: string, 
        token: string 
      }[]
    }[] = [];

  callSwapTokenOutForTokenIn: boolean = false;

  poolExist: boolean = true;
  loading: boolean = false;
  swapping: boolean = false;
  txId: string = "";

  swap = this.fb.group({
    tokenASymbol: ['GAS'],
    tokenA: ['0xd2a4cff31913016155e38e474a2c06d08be276cf'],
    tokenAAmount: [],
    tokenADecimals: [8],
    tokenAAvailable: [''],

    tokenBSymbol: [''],
    tokenB: [],
    tokenBAmount: [],
    tokenBDecimals: [0],

    tokenBPerTokenA: [0],
    tokenAFee: [0],
    expected: [0],
    amountInMax: [0],
    amountOutMin: [0],

    liquidityPoolContractAddress: ['']
  });

  constructor(
    private walletProvider: WalletProviderService,
    private fb: FormBuilder,
    private settings: SettingsService,
    private tokenService: TokenService,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {

    this.walletProvider.walletInitialized.subscribe(intialised => 
      {
        if(intialised)
        {
          this.walletProvider.Wallet()
          .getAllExchangePair()
          .then(e => this.allExchangePairs = e)
          .then(() => this.getPairAddress());
        }
      });
  }

  openTokenSelectDialog(token: string)
  {
    let dialogRef = this.dialog.open(TokenSelectDialogComponent, {panelClass: "custom-token-select-modalbox"});

    dialogRef.componentInstance.tokenEmitter.subscribe(val => 
      {
        if(val)
        {
          if(token === "tokenA")
          {
            this.setSwapPairField('tokenASymbol', val.symbol);
            this.setSwapPairField('tokenA', val.scriptHash);
            this.setSwapPairField('tokenADecimals', val.decimals);
            this.setSwapPairField('tokenBPerTokenA', 0);
            this.setSwapPairField('tokenAAmount', "");
            this.setSwapPairField('tokenBAmount', "");
          }
          else
          {
            this.setSwapPairField('tokenBSymbol', val.symbol);
            this.setSwapPairField('tokenB', val.scriptHash);
            this.setSwapPairField('tokenBDecimals', val.decimals);
            this.setSwapPairField('tokenBPerTokenA', 0);
            this.setSwapPairField('tokenAAmount', "");
            this.setSwapPairField('tokenBAmount', "");
          }
          
          dialogRef.close();

          if(this.walletProvider.walletInitialized.value)
          {
            this.getPairAddress();
            this.getBalances();
          }
        }
      });

    this.settings.getMultihopsDisabledObservable().subscribe((change) => this.getPairAddress());
  }

  tokenAAmountInput(input: any)
  {
    if(this.poolExist && this.walletProvider.walletInitialized.value)
    {
      this.setSwapPairField("tokenAAmount", (input as HTMLInputElement).value);
      this.updateTokenBAmount();
      this.updateTokenBPerTokenA();
    }
  }

  tokenBAmountInput(input: any)
  {
    if(this.poolExist && this.walletProvider.walletInitialized.value)
    {
      this.setSwapPairField("tokenBAmount", (input as HTMLInputElement).value);
      this.updateTokenAAmount();
      this.updateTokenBPerTokenA();
    }
  }

  swapToken()
  {
    this.swapping = true;

    if(this.callSwapTokenOutForTokenIn)
    {
      let amountOut = this.addZeros(this.getSwapField("tokenBAmount"), this.getSwapField("tokenBDecimals"))
      
      let amountInMax = this.addZeros(
        this.getSwapField("tokenAAmount"), 
        this.getSwapField("tokenADecimals")) * (1 + this.settings.getSlippageForCalculation())

      this.walletProvider.Wallet()
        .swapTokenOutForTokenIn(
          amountOut, 
          amountInMax, 
          this.liquidityPathAddresses)
        .then(e => this.txId = e)
        .finally(() => this.swapping = false);
    }
    else
    {
      let amountAIn = this.addZeros(this.getSwapField("tokenAAmount"), this.getSwapField("tokenADecimals"));

      var amountBMinOut = this.addZeros(
        this.getSwapField("tokenBAmount"), 
        this.getSwapField("tokenBDecimals")) * (1 - this.settings.getSlippageForCalculation());

      this.walletProvider.Wallet()
        .swapTokenInForTokenOut(
          amountAIn,
          amountBMinOut,
          this.liquidityPathAddresses)
          .then(e => this.txId = e)
          .finally(() => this.swapping = false);
    }
  }

  private addZeros(num: string, decimals: number)
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return parseFloat(num) * parseFloat(final);
  }

  private getPairAddress()
  {
    if(!this.walletProvider.walletInitialized.value)
    {
      return;
    }

    this.loading = true;
    this.poolExist = true;

    var tokenA = this.getSwapField("tokenA");
    var tokenB = this.getSwapField("tokenB");

    if(tokenA === null || tokenA === undefined || tokenB === null || tokenB === undefined)
    {
      this.loading = false;
      return;
    }

    if(tokenA === tokenB)
    {
      this.loading = false;
      this.poolExist = false;
      return;
    }

    this.liquidityPools = [];
    this.setSwapPairField("tokenBAmount", '');
    this.setSwapPairField("tokenBPerTokenA", 0);
    this.setSwapPairField("tokenAAmount", '');
    this.lpPath = [];


    if(this.settings.isMultihopsDisable())
    {
      var singlePool = this.allExchangePairs.find(lp => 
        (lp.tokenA == tokenA && lp.tokenB == tokenB)
        || (lp.tokenA == tokenB && lp.tokenB == tokenA));
  
      if(singlePool !== undefined)
      {
        this.liquidityPools.push(
          {
            tokenA: singlePool.tokenA,
            tokenB: singlePool.tokenB,
            poolAddress: singlePool.poolAddress,
            hasLiquidity: undefined,
            reserves: undefined
          }
        );
        this.loading = false;
      }
      else
      {
        this.poolExist = false;
      }
      this.loading = false;
    }
    else
    {
      this.getLiquidityPoolPaths(tokenA, tokenB);
    }
    

    this.liquidityPools.forEach(path =>
      {
        this.getLiquidityPoolReserve(path.poolAddress);
      });
  }

  private getBalances()
  {
    this.setSwapPairField("tokenAAvailable", '');

    if(!this.walletProvider.walletInitialized.value)
    {
      return;
    }

    let tokenASymbol = this.getSwapField("tokenASymbol");

    this.walletProvider.Wallet()
      .getBalances()
      .then(e => 
        {
          e.forEach(balance => {
            if(balance.symbol === tokenASymbol)
            {
              this.setSwapPairField("tokenAAvailable", balance.amount);
            }
          });
        });
  }

  private getLiquidityPoolPaths(tokenA: string, tokenB:string)
  {
    var usedPools = [];
    var canContinue = true;

    while(canContinue)
    {
      this.findLiquidityPoolPaths(tokenA, tokenB, this.liquidityPools, usedPools, []);

      var tokenAPoolExists = this.liquidityPools.find(e => e.tokenA === tokenA || e.tokenB === tokenA);
      var tokenBPoolExists = this.liquidityPools.find(e => e.tokenA === tokenB || e.tokenB === tokenB);

      if(tokenAPoolExists === undefined && tokenBPoolExists === undefined)
      {
        this.liquidityPools = [];
        canContinue = false;
      }
      else if(tokenAPoolExists === undefined || tokenBPoolExists === undefined)
      {
        usedPools.push(this.liquidityPools.pop().poolAddress);
        this.liquidityPools = [];
        
        canContinue = this.allExchangePairs.filter(element => 
            element.tokenA === tokenA 
          || element.tokenB === tokenA 
          || element.tokenA === tokenB
          || element.tokenB == tokenB) !== undefined;
      }
      else
      {
        canContinue = false;
      }
    }

    if(this.liquidityPools.length === 0)
    {
      this.poolExist = false;
      this.loading = false;
    }
  }

  private findLiquidityPoolPaths(from: string, to: string, path: any[], ignorePoolAddress: any[], usedPoolAddress: any[])
  {
    var start = this.allExchangePairs
      .filter(pair => !ignorePoolAddress.includes(pair.poolAddress))
      .filter(pair => !usedPoolAddress.includes(pair.poolAddress))
      .find(pair => pair.tokenA === from || pair.tokenB === from );

    if(start === null || start === undefined)
    {
      return;
    }

    path.push(start);

    if(start.tokenA === to || start.tokenB === to)
    {
      return;
    }

    usedPoolAddress.push(start.poolAddress);

    start.tokenA === from ?
      this.findLiquidityPoolPaths(start.tokenB, to, path, ignorePoolAddress, usedPoolAddress) : 
      this.findLiquidityPoolPaths(start.tokenA, to, path, ignorePoolAddress, usedPoolAddress);
  }

  private getLiquidityPoolReserve(pairAddress: string)
  {
    this.walletProvider.Wallet()
      .getReserves(pairAddress)
      .then(reserve => 
        {
          var pool = this.liquidityPools.find(e => e.poolAddress === pairAddress);
          pool.reserves = reserve;
          pool.hasLiquidity = (reserve[0].reserve !== "0" && reserve[1].reserve !== "0");
        }).finally(() => this.loading = false);
  }

  private getSwapField(field: string): any
  {
    return this.swap.get(field).value;
  }

  private setSwapPairField(field: string, value: any)
  {
    this.swap.get(field).setValue(value);
  }

  private updateTokenBAmount()
  {
    if(!this.IsNotEmptyNullOrNaN("tokenAAmount"))
    {
      return;
    }

    this.liquidityPathAddresses = [];

    this.getAmountsOut(
      this.getSwapField("tokenA"), 
      this.getSwapField("tokenAAmount"), 
      this.getSwapField("tokenB"), 
      this.liquidityPools);

    this.callSwapTokenOutForTokenIn = false;
  }

  private updateTokenBPerTokenA()
  {
    if(this.getSwapField('tokenBPerTokenA') === 0)
    {
      this.setSwapPairField("tokenBPerTokenA", parseFloat(this.getSwapField("tokenAAmount")) / parseFloat(this.getSwapField("tokenBAmount")));
    }

    this.setSwapPairField("tokenAFee", 0.003 * parseFloat(this.getSwapField("tokenAAmount")));

    if(parseFloat(this.getSwapField("tokenBAmount")))
    {
      this.setSwapPairField("expected", Number(parseFloat(this.getSwapField("tokenBAmount")).toFixed(5)));
    }
    
    if(this.callSwapTokenOutForTokenIn && parseFloat(this.getSwapField("tokenAAmount")))
    {
      this.setSwapPairField("amountInMax", 
      Number(parseFloat(this.getSwapField("tokenAAmount")) * (1 + this.settings.getSlippageForCalculation())).toFixed(5));
    }

    if(!this.callSwapTokenOutForTokenIn && parseFloat(this.getSwapField("tokenBAmount")))
    {
      this.setSwapPairField("amountOutMin", 
      Number(parseFloat(this.getSwapField("tokenBAmount")) * (1 - this.settings.getSlippageForCalculation())).toFixed(5));
    }

    this.lpPath = [];
    this.liquidityPathAddresses.forEach(path =>
      {
        this.tokenService.getToken(path)
          .then(result => this.lpPath.push(result));
      });
  }

  private getAmountsOut(tokenA: string, tokenAAmount: string, endToken: string, liquidityPools: any[])
  {
    if(!this.liquidityPathAddresses.includes(tokenA))
    {
      this.liquidityPathAddresses.push(tokenA);
    }
    
    var liquidityPool = liquidityPools.find(e => e.tokenA === tokenA || e.tokenB === tokenA);

    var found = liquidityPool.reserves.find(r => tokenA.includes(r.scriptHash));
    var other = liquidityPool.reserves.find(r => !tokenA.includes(r.scriptHash));

    let outputAmount = this.getAmountOut(
      parseFloat(tokenAAmount),
      parseFloat(found.reserve), 
      parseFloat(other.reserve))

    if(liquidityPool.tokenA === endToken 
      || liquidityPool.tokenB === endToken)
    {
      this.liquidityPathAddresses.push(endToken);
      this.setSwapPairField("tokenBAmount", outputAmount);
    }
    else
    {
      this.liquidityPathAddresses.push(other.scriptHash);

      this.getAmountsOut(
        other.scriptHash, 
        outputAmount.toString(), 
        endToken, 
        liquidityPools.filter(pair => !liquidityPool.poolAddress.includes(pair.poolAddress)));
    }
  }

  private updateTokenAAmount()
  {
    if(!this.IsNotEmptyNullOrNaN("tokenBAmount"))
    {
      return;
    }

    this.liquidityPathAddresses = [];

    this.getAmountsIn(
      this.getSwapField("tokenB"),
      this.getSwapField("tokenBAmount"),
      this.getSwapField("tokenA"),
      this.liquidityPools);

    this.callSwapTokenOutForTokenIn = true;
  }

  private getAmountsIn(tokenB: string, tokenBAmount: string, endToken: string, liquidityPools: any[])
  {
    if(!this.liquidityPathAddresses.includes(tokenB))
    {
      this.liquidityPathAddresses.push(tokenB);
    }
    
    var liquidityPool = liquidityPools.find(e => e.tokenA === tokenB || e.tokenB === tokenB);

    var found = liquidityPool.reserves.find(r => tokenB.includes(r.scriptHash));
    var other = liquidityPool.reserves.find(r => !tokenB.includes(r.scriptHash));

    let outputAmount = this.getAmountIn(
      parseFloat(tokenBAmount),
      parseFloat(other.reserve),
      parseFloat(found.reserve))

    if(liquidityPool.tokenA === endToken 
      || liquidityPool.tokenB === endToken)
    {
      this.liquidityPathAddresses.push(endToken);
      this.setSwapPairField("tokenAAmount", outputAmount);
    }
    else
    {
      this.liquidityPathAddresses.push(other.scriptHash);

      this.getAmountsIn(
        other.scriptHash, 
        outputAmount.toString(), 
        endToken, 
        liquidityPools.filter(pair => !liquidityPool.poolAddress.includes(pair.poolAddress)));
    }
  }


  private IsNotEmptyNullOrNaN(field: any) : boolean
  {
    return this.getSwapField(field) !== "" 
    && this.getSwapField(field) !== null
    && this.getSwapField(field) !== NaN;
  }
  
  private getAmountOut(amountA: number, reserveA: number, reserveB: number): number
  {
    var amountInWithFee = amountA * 997;
    var numerator = amountInWithFee * reserveB;
    var denominator = reserveA * 1000 + amountInWithFee;
    
    return numerator / denominator;
  }
  
  private getAmountIn(amountOut: number, reserveIn: number, reserveOut: number)
  {
      var numerator = reserveIn * amountOut * 1000;
      var denominator = (reserveOut - amountOut) * 997;
      var amountIn = (numerator / denominator);
      return amountIn;
  }

  swapOrder()
  {
    var tokenASymbol = this.getSwapField("tokenASymbol");
    var tokenA = this.getSwapField("tokenA");
    var tokenADecimals = this.getSwapField("tokenADecimals");

    this.setSwapPairField("tokenASymbol", this.getSwapField("tokenBSymbol"));
    this.setSwapPairField("tokenA", this.getSwapField("tokenB"));
    this.setSwapPairField("tokenAAmount", "");
    this.setSwapPairField("tokenADecimals", this.getSwapField("tokenBDecimals"));

    this.setSwapPairField("tokenBSymbol", tokenASymbol);
    this.setSwapPairField("tokenB", tokenA);
    this.setSwapPairField("tokenBAmount", "");
    this.setSwapPairField("tokenBDecimals", tokenADecimals);

    this.setSwapPairField("tokenBPerTokenA", 0);
    this.getBalances();
  }
}