import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyOrdersService } from 'src/app/services/my-orders.service';
import { ParametresService } from 'src/app/services/parametres.service';
import { ToastService } from 'src/app/toasts/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  commandeNum: number = 0;
  category_name: any;
  category_id: any;
  url = environment.url
  special: boolean;
  data: any = [];
  enableToOrder: boolean;

  constructor(private router:Router, private toastService:ToastService,private paramServices: ParametresService, private activeRouter: ActivatedRoute, private orderService: MyOrdersService) {

    this.orderService.calculate_quantity()
    this.commandeNum = this.orderService.cart_quantity.value
    this.orderService.cart_quantity.subscribe((qte) => {
      this.commandeNum = qte
    })
    this.activeRouter.params.subscribe(params => {

      this.category_id = params.id
      this.category_name = params.nom
      this.special = params.special
      this.getProductByCategory(params.id, params.special)
    })

  }

  ngOnInit() {

  }
  ionViewWillEnter() {
    this.orderService.calculate_quantity()
    this.commandeNum = this.orderService.cart_quantity.value
    this.orderService.cart_quantity.subscribe((qte) => {
      this.commandeNum = qte
    })
    if (this.data)
      this.data.forEach(d => {
        // let reduction =  (100 - (parseFloat(this.special?d.prixspecial:d.prixfinal) * 100 / parseFloat(d.prixinitial))).toFixed(0) 
        // d.reduction = reduction;
        d.qte = this.orderService.get_product_quantity(d.id);

      });
  }
  ionViewWillLeave() {
    this.orderService.calculate_quantity()
    this.commandeNum = this.orderService.cart_quantity.value
    this.orderService.cart_quantity.subscribe((qte) => {
      this.commandeNum = qte
    })
    if (this.data)
      this.data.forEach(d => {
        // let reduction =  (100 - (parseFloat(this.special?d.prixspecial:d.prixfinal) * 100 / parseFloat(d.prixinitial))).toFixed(0) 
        // d.reduction = reduction;
        d.qte = this.orderService.get_product_quantity(d.id);
      });
  }

  checkProductInOrder(id) {
    for (let i = 0; i < this.orderService.myCart.value.length; i++) {
      if (id == this.orderService.myCart.value[i].id) return { exist: true, index: i }
    }
    return { exist: false, index: 0 }
  }

  addQty(prodct) {
    if ((prodct.quantity_type && (prodct.qte+1)>prodct.quantity_type_value )){
      this.enableToOrder = true
      this.toastService.presentErrorToast(`لا يمكنك طلب أكثر من ${prodct.quantity_type_value} `, 2000)

    } else{
      this.enableToOrder = false

      if(((prodct.qte+1) >prodct.quantity)){
      this.enableToOrder = true

        this.toastService.presentErrorToast('لقد تجاوزت الكمية المتوفرة', 2000)
      } else{
      this.enableToOrder = false

        prodct.qte++
        let product = { ...prodct, quantite: prodct.qte }
        if (this.checkProductInOrder(prodct.id).exist) {
          this.orderService.increaseOrderQuantity(this.checkProductInOrder(prodct.id).index)
        } else {
          this.orderService.addProductToOrder(product)
        }
      }
    }




  }
  gotoDetails(product){
    if(!product.quantity){
      this.enableToOrder = true
      this.toastService.presentErrorToast('لم يعد متوفر حاليا', 2000)
    } else{
      this.router.navigate(['/product-detail'],{queryParams:product})

    }
  }

  minusQty(prodct) {
    prodct.qte--
    if (this.checkProductInOrder(prodct.id).exist) {
      let index = this.checkProductInOrder(prodct.id).index
      let product = this.orderService.myCart.value[index]
      if (product.quantite === 1) {
        this.orderService.removeProductFromOrder(index)
      } else {
        this.orderService.decreaseOrderQuantity(index)
      }
    }

  }

  getProductByCategory(id, special) {
    this.paramServices.getProductByCategory(id, special).subscribe(result => {
      this.data = result;
      this.data.forEach(d => {
        let reduction = (100 - (parseFloat(this.special ? d.prixspecial : d.prixfinal) * 100 / parseFloat(d.prixinitial))).toFixed(0)
        d.reduction = reduction;
        d.qte = this.orderService.get_product_quantity(d.id);
      });
    })
  }
}
