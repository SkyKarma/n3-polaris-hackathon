import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'src/app/services/interface/settings/settings.service';
import { TokenSelectDialogComponent } from 'src/app/dialog/token-select-dialog/token-select-dialog.component';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/services/interface/token/token.service';

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.scss']
})
export class AddLiquidityComponent implements OnInit {

  private tokenAParam: string = null;
  private tokenBParam: string = null;

  private reserves: { token: string, scriptHash: string, address: string, reserve: string }[] = [];

  poolTotalSupply: number = 0;

  firstLiquidity: boolean = false;
  poolDoesNotExist: boolean = false;
  loading: boolean = false;
  showPoolShare: boolean = false;
  addingLP: boolean = false;
  txId: string = '';

  private tokenPairContractAddress: string = "";

  token = this.fb.group({
    tokenA: ['0xecf114235d014e6f70455054c30ddb7151676d3f'],
    tokenAAmount: [],
    tokenASymbol: ['PUMPKIN'],
    tokenADecimals: [8],
    tokenAAvailable: [''],

    tokenB: [''],
    tokenBAmount: [],
    tokenBSymbol: [''],
    tokenBDecimals: [],
    tokenBAvailable: [''],

    poolShares: [],
    tokenBPerTokenA: [],
    tokenAPerTokenB: []
  });

  constructor(private fb: FormBuilder,
  private walletProvider: WalletProviderService,
  private settings: SettingsService,
  private dialog: MatDialog,
  private route: ActivatedRoute,
  private tokenService: TokenService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tokenAParam = params.get('tokenA');
      this.tokenBParam = params.get('tokenB');
    });

    this.walletProvider.walletInitialized.subscribe(initalised =>
      {
        if(initalised && this.tokenAParam !== null && this.tokenBParam !== null)
        {
          this.tokenService
          .getToken(this.tokenAParam)
          .then(result => 
            {
              this.token.get('tokenASymbol').setValue(result.symbol);
              this.token.get('tokenA').setValue(result.scriptHash);
              this.token.get('tokenADecimals').setValue(result.decimals);
            })
          .then(async () =>
          {
            await this.tokenService
            .getToken(this.tokenBParam)
            .then(result => 
              {
                this.token.get('tokenBSymbol').setValue(result.symbol);
                this.token.get('tokenB').setValue(result.scriptHash);
                this.token.get('tokenBDecimals').setValue(result.decimals);
              });
          })
          .then(() => this.getBalances());
        }
      })
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
            this.token.get('tokenASymbol').setValue(val.symbol);
            this.token.get('tokenA').setValue(val.scriptHash);
            this.token.get('tokenADecimals').setValue(val.decimals);
          }
          else
          {
            this.token.get('tokenBSymbol').setValue(val.symbol);
            this.token.get('tokenB').setValue(val.scriptHash);
            this.token.get('tokenBDecimals').setValue(val.decimals);
          }

          this.token.get('tokenAAmount').setValue('');
          this.token.get('tokenBAmount').setValue('');
          
          this.showPoolShare = false;
          dialogRef.close();
          this.getPairAddress();
          this.getBalances();
        }
      });
  }

  private getPairAddress()
  {
    if(this.token.get("tokenA").value !== '' 
      && this.token.get("tokenB").value !== '')
    {
      this.loading = true;
      this.walletProvider
        .Wallet()
        .getTokenPairContractAddress(
          this.token.get("tokenA").value,
          this.token.get("tokenB").value)
        .then(result => 
          {
            this.poolDoesNotExist = false;
            this.tokenPairContractAddress = atob(result);
          })
          .then(async () =>
          {
            try 
            {
              const reserve = await this.walletProvider.Wallet()
                .getReserves(this.tokenPairContractAddress);
              this.reserves = reserve;
              this.firstLiquidity = (parseFloat(reserve[0].reserve) === 0 && parseFloat(reserve[1].reserve) === 0);
            }
            catch {

            }
          })
          .then(async () =>
          {
            if(!this.firstLiquidity)
            {
              const supply = await this.walletProvider.Wallet()
              .getTotalSupply(this.tokenPairContractAddress);
              this.poolTotalSupply = parseFloat(supply);
            }
          })
          .catch(() => {this.poolDoesNotExist = true})
          .finally(() => this.loading = false);
    }
  }

  tokenAAmountInput(input: any)
  {
    this.token.get("tokenAAmount").setValue((input as HTMLInputElement).value);
    if(!this.firstLiquidity)
    {
      this.updateTokenBAmount();
      this.calculateSharesOfPool();
      this.calculateTokensPerToken();
    }
    else
    {
      this.showPoolShare = false;
    }
  }

  tokenBAmountInput(input: any)
  {
    this.token.get("tokenBAmount").setValue((input as HTMLInputElement).value);
    if(!this.firstLiquidity)
    {
      this.updateTokenAAmount();
      this.calculateSharesOfPool();
      this.calculateTokensPerToken();
    }
    else
    {
      this.showPoolShare = false;
    }
  }

  private updateTokenBAmount()
  {
    if(this.token.get("tokenAAmount").value !== "" 
      && this.token.get("tokenAAmount").value !== null
      && this.token.get("tokenAAmount").value !== NaN
      && this.reserves.length > 0)
    {
      var found = this.reserves.find(r => this.token.get("tokenA").value.includes(r.scriptHash));
      var other = this.reserves.find(r => !this.token.get("tokenA").value.includes(r.scriptHash));

      this.token.get("tokenBAmount")
        .setValue(
          this.getAmount(
            parseFloat(this.token.get("tokenAAmount").value), 
            parseFloat(found.reserve), 
            parseFloat(other.reserve)));
    }
  }

  private updateTokenAAmount()
  {
    if(this.token.get("tokenBAmount").value !== "" 
      && this.token.get("tokenBAmount").value !== null
      && this.token.get("tokenBAmount").value !== NaN
      && this.reserves.length > 0)
    {
      var found = this.reserves.find(r => this.token.get("tokenB").value.includes(r.scriptHash));
      var other = this.reserves.find(r => !this.token.get("tokenB").value.includes(r.scriptHash));

      this.token.get("tokenAAmount")
        .setValue(
          this.getAmount(
            parseFloat(this.token.get("tokenBAmount").value), 
            parseFloat(found.reserve), 
            parseFloat(other.reserve)));
    }
  }

  addLiquidity()
  {
    this.addingLP = true;
    
    let tokenAAmount = this.addZeros(this.token.get("tokenAAmount").value, this.token.get("tokenADecimals").value);
    let tokenBAmount = this.addZeros(this.token.get("tokenBAmount").value, this.token.get("tokenBDecimals").value);
    var token0 = this.reserves.find(e => e.token === "token0");

    if(this.firstLiquidity)
    {
      if(token0.scriptHash === this.token.get('tokenA').value)
      {
        this.add(
          this.token.get('tokenA').value, 
          tokenAAmount, 
          0, 
          this.token.get('tokenB').value, 
          tokenBAmount, 
          0);
      }
      else
      {
        this.add(
          this.token.get('tokenB').value, 
          tokenBAmount, 
          0,
          this.token.get('tokenA').value, 
          tokenAAmount, 
          0);
      }
      
    }
    else
    {
      var tokenAMin = tokenAAmount * (1 - this.settings.getSlippageForCalculation());
      var tokenBMin = tokenBAmount * (1 - this.settings.getSlippageForCalculation());

      if(token0.scriptHash === this.token.get('tokenA').value)
      {
        this.add(
          this.token.get('tokenA').value, 
          tokenAAmount, 
          tokenAMin, 
          this.token.get('tokenB').value, 
          tokenBAmount, 
          tokenBMin);
      }
      else
      {
        this.add(
          this.token.get('tokenB').value, 
          tokenBAmount, 
          tokenBMin, 
          this.token.get('tokenA').value, 
          tokenAAmount, 
          tokenAMin);
      }
      
    }
  }

  private add(tokenA: string, tokenAAmount: number, tokenAMin: number, tokenB: string, tokenBAmount: number, tokenBMin: number)
  {
    this.walletProvider.Wallet()
    .addLiquidity(
      tokenA,
      tokenAAmount,
      tokenAMin,
      tokenB,
      tokenBAmount,
      tokenBMin,
      this.tokenPairContractAddress)
      .then(tx => this.txId = tx)
      .finally(() => this.addingLP = false)
  }

  private addZeros(num: string, decimals: number) : number
  {
    var final = "1";
    for (let index = 0; index < decimals; index++) {
      final = final + "0";
    }
    return parseFloat(num) * parseFloat(final);
  }

  private getAmount(amountA: number, reserveA: number, reserveB: number): number
  {
    return amountA * reserveB / reserveA;
  }

  private calculateSharesOfPool()
  {
    let reserve0 = parseFloat(this.reserves.find(r => r.scriptHash === this.token.get("tokenA").value).reserve);
    let reserve1 = parseFloat(this.reserves.find(r => r.scriptHash === this.token.get("tokenB").value).reserve);

    let amount0 = this.addZeros(this.token.get("tokenAAmount").value, this.token.get("tokenADecimals").value);
    let amount1 = this.addZeros(this.token.get("tokenAAmount").value, this.token.get("tokenADecimals").value);

    let liquidity0 = (amount0 * this.poolTotalSupply)/reserve0;
    let liquidity1 = (amount1 * this.poolTotalSupply)/reserve1;

    if(liquidity0 > liquidity1)
    {
      this.token.get("poolShares").setValue(parseFloat(((liquidity1/(this.poolTotalSupply + liquidity1))*100).toFixed(5)))
    }
    else
    {
      this.token.get("poolShares").setValue(parseFloat(((liquidity0/(this.poolTotalSupply + liquidity0))*100).toFixed(5)))
    }
    this.showPoolShare = true;
  }

  private calculateTokensPerToken()
  {
    this.token.get("tokenBPerTokenA")
      .setValue((parseFloat(this.token.get("tokenAAmount").value) / parseFloat(this.token.get("tokenBAmount").value)).toFixed(4));
      this.token.get("tokenAPerTokenB")
      .setValue((parseFloat(this.token.get("tokenBAmount").value) / parseFloat(this.token.get("tokenAAmount").value)).toFixed(4));
  }

  private getBalances()
  {
    this.token.get('tokenAAvailable').setValue('');
    this.token.get('tokenBAvailable').setValue('');

    if(!this.walletProvider.walletInitialized.value)
    {
      return;
    }

    let tokenASymbol = this.token.get('tokenASymbol').value;
    let tokenBSymbol = this.token.get('tokenBSymbol').value;


    this.walletProvider.Wallet()
      .getBalances()
      .then(e => 
        {
          e.forEach(balance => {
            if(balance.symbol === tokenASymbol)
            {
              this.token.get('tokenAAvailable').setValue(balance.amount);
            }
            else if(balance.symbol === tokenBSymbol)
            {
              this.token.get('tokenBAvailable').setValue(balance.amount);
            }
          });
        });
  }
}