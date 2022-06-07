import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-lock-liquidity',
  templateUrl: './lock-liquidity.component.html',
  styleUrls: ['./lock-liquidity.component.scss']
})
export class LockLiquidityComponent implements OnInit {

  // allLiquidityPools:
  symbolAndDecimals: {contract: string, decimals: number, symbol: string}[] = [];
  liquidity: {contract: string, symbol: string, amount: string, tokenA: string, tokenB: string}[];
  liquidityLoaded: boolean = false;

  lockedUpLiquidity: { owner: string, contract: string, endDate: Date, amount: number, counter: number }[] = [];
  fullyLoaded: boolean = false;

  liquidityToLock = this.fb.group({
    contract: [''],
    symbol: [''],
    totalAmount: [''],
    lockAmount: [''],
    length: [1826]
  });

  now: Date = new Date;

  showLockedAmountMessage: boolean = false;
  showLockedUpLengthMessage: boolean = false;

  constructor(private walletProvider: WalletProviderService,
    private fb: FormBuilder) { }

  ngOnInit(): void {

    this.liquidityToLock.get('lockAmount').valueChanges.subscribe((val) =>
    {
      if(parseFloat(val))
      {
        this.showLockedAmountMessage = (parseFloat(val)/parseFloat(this.liquidityToLock.get('totalAmount').value) < 0.8);
      }
    });

    this.liquidityToLock.get('length').valueChanges.subscribe((val) =>
    {
      if(parseFloat(val))
      {
        this.showLockedUpLengthMessage = parseFloat(val) < 1095;
      }
    });

    this.walletProvider.walletInitialized.subscribe((initialised) =>
    {
      if(initialised)
      {
        this.walletProvider
          .Wallet()
          .getLiquidity()
          .then(e => this.liquidity = e)
          .then(async () =>
          {
            this.liquidityLoaded = true;
            if(this.liquidity.length > 0)
            {
              await this.walletProvider
              .Wallet()
              .getAddressLiquidityLockup()
              .then(lps => this.lockedUpLiquidity = lps.filter(lp => lp.amount > 0));
            }
          })
          .then(async () => {
            await Promise.all(this.lockedUpLiquidity.map(async (element) =>
            {
              this.walletProvider
                  .Wallet()
                  .getSymbolAndDecimals(element.contract)
                  .then(response => this.symbolAndDecimals.push({contract: element.contract, symbol: response.symbol, decimals: response.decimals}))
            }))
          })
          .finally(() => this.fullyLoaded = true);
      }
    })
  }

  getSymbol(address: string)
  {
    var result = this.symbolAndDecimals.find(e => e.contract === address)
    
    if(result === undefined)
    {
      return "";
    }
    
    if(result.symbol.startsWith("PLP"))
    {
      var splitted = result.symbol.split('-');
      var tokenB = splitted.pop();
      return splitted.pop() + " / " + tokenB;
    }

    return result.symbol;
  }

  lock(lp: {contract: string, symbol: string, amount: string, tokenA: string, tokenB: string})
  {
    this.liquidityToLock.get('symbol').setValue(lp.symbol);
    this.liquidityToLock.get('contract').setValue(lp.contract);
    this.liquidityToLock.get('totalAmount').setValue(lp.amount);
    this.liquidityToLock.get('lockAmount').setValue(lp.amount);
    this.liquidityToLock.get('length').setValue(1826);
  }

  back()
  {
    this.liquidityToLock.get('symbol').setValue("");
    this.liquidityToLock.get('contract').setValue("");
    this.liquidityToLock.get('totalAmount').setValue("");
    this.liquidityToLock.get('lockAmount').setValue("");
    this.liquidityToLock.get('length').setValue("");
  }

  unlock(element)
  {
    this.walletProvider
      .Wallet()
      .unlockLiquidity(element.contract, element.counter)
      .then(result => console.log(result));
  }

  confirm()
  {
    var myDate = new Date(new Date().getTime()+(this.liquidityToLock.get('length').value * 24 * 60 * 60 * 1000));

    this.walletProvider
      .Wallet()
      .lockLiquidity(
        this.liquidityToLock.get('contract').value, 
        this.addZeros(this.liquidityToLock.get('lockAmount').value, 8), 
        myDate.getTime())
      .then(e => console.log(e));
  }

  private addZeros(num: string, decimals: number)
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return parseFloat(num) * parseFloat(final);
  }
}
