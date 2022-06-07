import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/services/interface/token/token.service';
import { TokenSelectDialogComponent } from 'src/app/dialog/token-select-dialog/token-select-dialog.component';
import { WalletProviderService } from 'src/app/wallet/wallet-provider/wallet-provider.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  availablePools: {tokenA: string, tokenB: string, poolAddress: string}[] = [];
  error: boolean = false;
  poolMessage: string = "";

  showTokenPair: boolean = false;

  token = this.fb.group({
    tokenA: ['0xecf114235d014e6f70455054c30ddb7151676d3f'],
    tokenASymbol: ['PUMPKIN'],

    tokenB: [''],
    tokenBSymbol: ['']
  });

  tokenALoading: boolean = false;
  tokenAFault: boolean = false;

  constructor(private fb: FormBuilder,
    private walletProvider: WalletProviderService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private service: TokenService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if(params.get('tokenA') === null)
      {
        return;
      }

      this.token.get('tokenA').setValue(params.get('tokenA'));
      this.token.get('tokenASymbol').setValue("Loading");
      this.tokenALoading = true;
    });

    this.walletProvider.walletInitialized.subscribe(initialised =>
    {
      if(initialised)
      {
        if(this.token.get("tokenASymbol").value === "Loading")
        {
          this.service
            .getToken(this.token.get("tokenA").value)
            .then(token => 
              {
                this.token.get('tokenASymbol').setValue(token.symbol);
                this.tokenALoading = false;
              })
              .then(() => 
              {
                this.walletProvider
                  .Wallet()
                  .getAllExchangePair()
                  .then(result => 
                    {
                      this.availablePools = result;
                    })
              });
        }
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
            this.token.get("tokenASymbol").setValue(val.symbol);
            this.token.get("tokenA").setValue(val.scriptHash);
          }
          else
          {
            this.token.get("tokenBSymbol").setValue(val.symbol);
            this.token.get("tokenB").setValue(val.scriptHash);
          }
          
          dialogRef.close();
          this.checkIfExchangeExists();
        }
      });
  }

  private checkIfExchangeExists()
  {
    var tokenA = this.token.get('tokenA').value;
    var tokenB = this.token.get("tokenB").value;
    if( tokenA !== "" && tokenB !== "")
    {
      this.error = false;
      this.poolMessage = "";

      if(tokenA == tokenB)
      {
        this.error = true;
        this.poolMessage = "Can not create an exchange with the same pair";
      }
      var exchangeFound = this.availablePools
        .find(lp => 
          (lp.tokenA === tokenA && lp.tokenB === tokenB) 
          || (lp.tokenA === tokenB && lp.tokenB === tokenA));
      
      if(exchangeFound !== undefined)
      {
        this.error = true;
        this.poolMessage = "Liquidity pool already exists!";
      }
    }
  }

  deployPoolPair()
  {
    if(this.error)
    {
      return;
    }

    this.walletProvider
      .Wallet()
      .deploySwapPairContract("PLP-" + this.token.get("tokenASymbol").value + "-" + this.token.get("tokenBSymbol").value, 
        this.token.get("tokenA").value,
        this.token.get("tokenB").value)
        .then(result => console.log(result));
  }
}
