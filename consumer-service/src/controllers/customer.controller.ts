import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  addCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.addCustomer(req.body);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.customerService.getAllCustomers(page, limit);

      res.json({
        success: true,
        data: result.customers,
        meta: {
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const customer = await this.customerService.getCustomerById(
        req.params.email
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  updateCustomerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const customer = await this.customerService.updateCustomer(
        req.params.email,
        req.body
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  deleteCustomerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.customerService.deleteCustomer(req.params.email);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  };

  loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email;
      const token = await this.customerService.getCustomerByEmail(email);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.getCustomerByEmail(
        req.params.email
      );
      res.json({ success: true, data: customer.addresses });
    } catch (error) {
      next(error);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.addAddress(
        req.params.email,
        req.body
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.updateAddress(
        req.params.email,
        req.params.addressId,
        req.body
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.deleteAddress(
        req.params.email,
        req.params.addressId
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  addOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.customerService.addOrder(
        req.params.email,
        req.body.orderId
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await this.customerService.getOrders(req.params.email);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.customerService.cancelOrder(
        req.params.email,
        req.params.orderId
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.getCart(req.params.email);
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.addToCart(
        req.params.email,
        req.body.productId,
        req.body.quantity
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  updateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.updateCart(
        req.params.email,
        req.params.productId,
        req.body.quantity
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  removeProductFromCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const customer = await this.customerService.removeProductFromCart(
        req.params.email,
        req.params.productId
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.removeFromCart(
        req.params.email
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wishlist = await this.customerService.getWishlist(req.params.email);
      res.json({ success: true, data: wishlist });
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.addToWishlist(
        req.params.email,
        req.body.productId
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const customer = await this.customerService.removeFromWishlist(
        req.params.email,
        req.params.productId
      );
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };
}
