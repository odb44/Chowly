import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Role = 'CUSTOMER' | 'WAITER'
type MenuType = 'FOOD' | 'DRINK'
type OrderStatus = 'PENDING' | 'PREPARING' | 'SERVED' | 'PAID'
type PreparationStatus = 'PENDING' | 'PREPARING' | 'READY'

interface MenuItem {
  id: number
  name: string
  type: MenuType
  price: number
  availability: boolean
  preparationTime: number
}

interface Table {
  id: number
  number: number
  capacity: number
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface OrderItemRequest {
  menuItemId: number
  quantity: number
}

interface OrderItemResponse {
  id: number
  orderId: number
  menuItemId: number
  menuItemName: string
  quantity: number
  unitPrice: number
  preparationStatus: PreparationStatus
  chefId: number | null
  chefName: string | null
  bartenderId: number | null
  bartenderName: string | null
}

interface OrderResponse {
  id: number
  tableId: number
  tableNumber: number
  waiterId?: number | null
  waiterName?: string | null
  status: OrderStatus
  estimatedWaitTime: number
  totalAmount: number
  orderDate: string
  items: OrderItemResponse[]
}

interface StaffMember {
  id: number
  name: string
}

interface PaymentResponse {
  id: number
  orderId: number
  status: string
  amount: number
  paymentDate?: string | null
  method?: string
}

const API_BASE_URL = 'https://chowly-backend-ywdp.onrender.com/api'

function parseBackendDateTime(orderDate: string) {
  if (!orderDate) {
    return NaN
  }

  // Spring Boot LocalDateTime values from the deployed backend have no
  // timezone/offset. Render runs the backend on UTC, so interpret the
  // database timestamp as UTC before comparing it with the browser clock.
  const hasTimezone =
      orderDate.endsWith('Z') ||
      /[+-]\\d{2}:?\\d{2}$/.test(orderDate)

  return new Date(
      hasTimezone ? orderDate : `${orderDate}Z`,
  ).getTime()
}

function getRemainingWaitTime(order: OrderResponse) {
  const orderTime = parseBackendDateTime(order.orderDate)

  if (Number.isNaN(orderTime)) {
    return order.estimatedWaitTime
  }

  const elapsedMinutes =
      (Date.now() - orderTime) / 60000

  return order.estimatedWaitTime - elapsedMinutes
}

function formatRemainingWaitTime(minutes: number) {
  const absoluteMinutes = Math.abs(minutes)
  const wholeMinutes = Math.floor(absoluteMinutes)
  const seconds = Math.floor(
      (absoluteMinutes * 60) % 60,
  )

  return `${minutes < 0 ? '-' : ''}${wholeMinutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
}

function App() {
  const [role, setRole] = useState<Role>('CUSTOMER')

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])

  const [activeCategory, setActiveCategory] =
      useState<'ALL' | MenuType>('ALL')

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTable, setSelectedTable] =
      useState<number | ''>('')

  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [refreshingOrder, setRefreshingOrder] =
      useState(false)
  const [processingPayment, setProcessingPayment] =
      useState(false)

  const [feedbackComment, setFeedbackComment] =
      useState('')
  const [ratingScore, setRatingScore] =
      useState<number | null>(null)
  const [ratingComment, setRatingComment] =
      useState('')
  const [submittingComplaint, setSubmittingComplaint] =
      useState(false)
  const [submittingRating, setSubmittingRating] =
      useState(false)
  const [complaintSubmitted, setComplaintSubmitted] =
      useState(false)
  const [ratingSubmitted, setRatingSubmitted] =
      useState(false)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [currentOrder, setCurrentOrder] =
      useState<OrderResponse | null>(null)

  const [remainingWaitTime, setRemainingWaitTime] =
      useState(0)

  // Waiter state
  const [waiterOrders, setWaiterOrders] =
      useState<OrderResponse[]>([])
  const [waiterLoading, setWaiterLoading] =
      useState(false)
  const [waiterError, setWaiterError] =
      useState('')
  const [selectedWaiterOrder, setSelectedWaiterOrder] =
      useState<OrderResponse | null>(null)

  const [chefs, setChefs] = useState<StaffMember[]>([])
  const [bartenders, setBartenders] =
      useState<StaffMember[]>([])

  const [selectedWaiterOrderId, setSelectedWaiterOrderId] =
      useState<number | null>(null)

  const [updatingItemId, setUpdatingItemId] =
      useState<number | null>(null)

  const [updatingOrderStatus, setUpdatingOrderStatus] =
      useState(false)

  const [waiterActionMessage, setWaiterActionMessage] =
      useState('')

  const [waiterRemainingWaitTimes, setWaiterRemainingWaitTimes] =
      useState<Record<number, number>>({})

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!currentOrder) {
      setRemainingWaitTime(0)
      return
    }

    const updateRemainingWaitTime = () => {
      if (
          currentOrder.status === 'SERVED' ||
          currentOrder.status === 'PAID'
      ) {
        setRemainingWaitTime(0)
        return
      }

      setRemainingWaitTime(
          getRemainingWaitTime(currentOrder),
      )
    }

    updateRemainingWaitTime()

    const timer = setInterval(
        updateRemainingWaitTime,
        1000,
    )

    return () => clearInterval(timer)
  }, [currentOrder])


  useEffect(() => {
    if (!currentOrder) {
      return
    }

    const interval = window.setInterval(() => {
      refreshCurrentOrder(currentOrder.id, true)
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [currentOrder?.id])

  useEffect(() => {
    if (role !== 'WAITER' || waiterOrders.length === 0) {
      setWaiterRemainingWaitTimes({})
      return
    }

    const updateWaiterRemainingWaitTimes = () => {
      const nextTimes: Record<number, number> = {}

      waiterOrders.forEach((order) => {
        if (
            order.status === 'SERVED' ||
            order.status === 'PAID'
        ) {
          nextTimes[order.id] = 0
        } else {
          nextTimes[order.id] =
              getRemainingWaitTime(order)
        }
      })

      setWaiterRemainingWaitTimes(nextTimes)
    }

    updateWaiterRemainingWaitTimes()

    const timer = setInterval(
        updateWaiterRemainingWaitTimes,
        1000,
    )

    return () => clearInterval(timer)
  }, [role, waiterOrders])


  useEffect(() => {
    if (role === 'WAITER') {
      loadWaiterData()
    }
  }, [role])

  async function loadInitialData() {
    try {
      setLoading(true)
      setError('')

      const [menuResponse, tablesResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/menu-items`),
            fetch(`${API_BASE_URL}/tables`),
          ])

      if (!menuResponse.ok) {
        throw new Error('Unable to load the menu.')
      }

      if (!tablesResponse.ok) {
        throw new Error('Unable to load tables.')
      }

      const menuData: MenuItem[] =
          await menuResponse.json()

      const tableData: Table[] =
          await tablesResponse.json()

      setMenuItems(menuData)
      setTables(tableData)
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Something went wrong while loading Chowly.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function refreshCurrentOrder(
      orderId: number,
      automatic = false,
  ) {
    try {
      if (!automatic) {
        setRefreshingOrder(true)
        setError('')
      }

      const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}`,
      )

      if (!response.ok) {
        throw new Error(
            'Unable to refresh the order status.',
        )
      }

      const orderData: OrderResponse =
          await response.json()

      setCurrentOrder(orderData)
    } catch (err) {
      if (!automatic) {
        setError(
            err instanceof Error
                ? err.message
                : 'Unable to refresh the order.',
        )
      }
    } finally {
      if (!automatic) {
        setRefreshingOrder(false)
      }
    }
  }

  async function loadWaiterData() {
    try {
      setWaiterLoading(true)
      setWaiterError('')
      setWaiterActionMessage('')

      const [
        ordersResponse,
        chefsResponse,
        bartendersResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/chefs`),
        fetch(`${API_BASE_URL}/bartenders`),
      ])

      if (!ordersResponse.ok) {
        throw new Error('Unable to load orders.')
      }

      if (!chefsResponse.ok) {
        throw new Error('Unable to load chefs.')
      }

      if (!bartendersResponse.ok) {
        throw new Error('Unable to load bartenders.')
      }

      const ordersData: OrderResponse[] =
          await ordersResponse.json()

      const chefsData: StaffMember[] =
          await chefsResponse.json()

      const bartendersData: StaffMember[] =
          await bartendersResponse.json()

      setWaiterOrders(ordersData)
      setChefs(chefsData)
      setBartenders(bartendersData)

      if (
          selectedWaiterOrderId !== null &&
          ordersData.some(
              (order) =>
                  order.id === selectedWaiterOrderId,
          )
      ) {
        await loadWaiterOrder(
            selectedWaiterOrderId,
        )
      }
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to load waiter data.',
      )
    } finally {
      setWaiterLoading(false)
    }
  }

  async function loadWaiterOrder(orderId: number) {
    try {
      setWaiterError('')

      const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}`,
      )

      if (!response.ok) {
        throw new Error(
            'Unable to load the selected order.',
        )
      }

      const orderData: OrderResponse =
          await response.json()

      setSelectedWaiterOrder(orderData)
      setSelectedWaiterOrderId(orderId)
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to load the selected order.',
      )
    }
  }

  async function refreshWaiterData() {
    try {
      setWaiterLoading(true)
      setWaiterError('')
      setWaiterActionMessage('')

      const response = await fetch(
          `${API_BASE_URL}/orders`,
      )

      if (!response.ok) {
        throw new Error('Unable to refresh orders.')
      }

      const ordersData: OrderResponse[] =
          await response.json()

      setWaiterOrders(ordersData)

      if (selectedWaiterOrderId !== null) {
        await loadWaiterOrder(
            selectedWaiterOrderId,
        )
      }
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to refresh orders.',
      )
    } finally {
      setWaiterLoading(false)
    }
  }

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'ALL') {
      return menuItems
    }

    return menuItems.filter(
        (item) => item.type === activeCategory,
    )
  }, [menuItems, activeCategory])

  const cartTotal = useMemo(() => {
    return cart.reduce(
        (total, item) =>
            total +
            item.menuItem.price * item.quantity,
        0,
    )
  }, [cart])

  const estimatedWait = useMemo(() => {
    if (cart.length === 0) {
      return 0
    }

    return Math.max(
        ...cart.map(
            (item) =>
                item.menuItem.preparationTime,
        ),
    )
  }, [cart])

  const cartItemCount = useMemo(() => {
    return cart.reduce(
        (total, item) => total + item.quantity,
        0,
    )
  }, [cart])

  const waiterPendingCount = useMemo(() => {
    return waiterOrders.filter(
        (order) => order.status === 'PENDING',
    ).length
  }, [waiterOrders])

  const waiterPreparingCount = useMemo(() => {
    return waiterOrders.filter(
        (order) => order.status === 'PREPARING',
    ).length
  }, [waiterOrders])

  const waiterServedCount = useMemo(() => {
    return waiterOrders.filter(
        (order) =>
            order.status === 'SERVED' ||
            order.status === 'PAID',
    ).length
  }, [waiterOrders])

  function addToCart(menuItem: MenuItem) {
    setSuccessMessage('')
    setError('')

    setCart((currentCart) => {
      const existingItem =
          currentCart.find(
              (item) =>
                  item.menuItem.id === menuItem.id,
          )

      if (existingItem) {
        return currentCart.map((item) =>
            item.menuItem.id === menuItem.id
                ? {
                  ...item,
                  quantity:
                      item.quantity + 1,
                }
                : item,
        )
      }

      return [
        ...currentCart,
        {
          menuItem,
          quantity: 1,
        },
      ]
    })
  }

  function decreaseQuantity(menuItemId: number) {
    setCart((currentCart) =>
        currentCart
            .map((item) =>
                item.menuItem.id === menuItemId
                    ? {
                      ...item,
                      quantity:
                          item.quantity - 1,
                    }
                    : item,
            )
            .filter(
                (item) => item.quantity > 0,
            ),
    )
  }

  function increaseQuantity(menuItemId: number) {
    setCart((currentCart) =>
        currentCart.map((item) =>
            item.menuItem.id === menuItemId
                ? {
                  ...item,
                  quantity:
                      item.quantity + 1,
                }
                : item,
        ),
    )
  }

  function removeFromCart(menuItemId: number) {
    setCart((currentCart) =>
        currentCart.filter(
            (item) =>
                item.menuItem.id !== menuItemId,
        ),
    )
  }

  async function placeOrder() {
    if (selectedTable === '') {
      setError(
          'Please select a table before placing your order.',
      )
      return
    }

    if (cart.length === 0) {
      setError(
          'Please add at least one item to your order.',
      )
      return
    }

    try {
      setPlacingOrder(true)
      setError('')
      setSuccessMessage('')

      const orderItems: OrderItemRequest[] =
          cart.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
          }))

      const response = await fetch(
          `${API_BASE_URL}/orders`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                  'application/json',
            },
            body: JSON.stringify({
              tableId: selectedTable,
              items: orderItems,
            }),
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to place the order.',
        )
      }

      setCurrentOrder(responseData)

      setSuccessMessage(
          `Order #${responseData.id} has been placed successfully.`,
      )

      setCart([])
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Something went wrong while placing the order.',
      )
    } finally {
      setPlacingOrder(false)
    }
  }

  async function updateWaiterOrderStatus(
      orderId: number,
      status: OrderStatus,
  ) {
    try {
      setUpdatingOrderStatus(true)
      setWaiterError('')
      setWaiterActionMessage('')

      const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}/status?status=${status}`,
          {
            method: 'PUT',
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            `Unable to change order status to ${status}.`,
        )
      }

      // Keep the item-level preparation state in sync with the
      // overall order status. This makes the waiter workflow
      // visible to the customer as well as the waiter.
      if (status === 'PREPARING') {
        for (const item of responseData.items ?? []) {
          if (item.preparationStatus !== 'PREPARING') {
            const itemResponse = await fetch(
                `${API_BASE_URL}/order-items/${item.id}/preparation-status?preparationStatus=PREPARING`,
                { method: 'PUT' },
            )

            if (!itemResponse.ok) {
              const itemError = await itemResponse.json().catch(() => ({}))
              throw new Error(
                  itemError.message ||
                  `Unable to update preparation status for ${item.menuItemName}.`,
              )
            }
          }
        }
      }

      if (status === 'SERVED') {
        for (const item of responseData.items ?? []) {
          if (item.preparationStatus !== 'READY') {
            const itemResponse = await fetch(
                `${API_BASE_URL}/order-items/${item.id}/preparation-status?preparationStatus=READY`,
                { method: 'PUT' },
            )

            if (!itemResponse.ok) {
              const itemError = await itemResponse.json().catch(() => ({}))
              throw new Error(
                  itemError.message ||
                  `Unable to mark ${item.menuItemName} as ready.`,
              )
            }
          }
        }
      }

      // Reload the order after item-level updates so the UI contains
      // the final order status and the final preparation statuses.
      const refreshedResponse = await fetch(
          `${API_BASE_URL}/orders/${orderId}`,
      )

      if (!refreshedResponse.ok) {
        throw new Error('Order status changed, but the updated order could not be loaded.')
      }

      const refreshedOrder: OrderResponse =
          await refreshedResponse.json()

      setSelectedWaiterOrder(refreshedOrder)

      setWaiterOrders((orders) =>
          orders.map((order) =>
              order.id === orderId
                  ? refreshedOrder
                  : order,
          ),
      )

      setWaiterActionMessage(
          status === 'PREPARING'
              ? `Order #${orderId} is now being prepared.`
              : status === 'SERVED'
                  ? `Order #${orderId} has been marked as served and all items are ready.`
                  : `Order #${orderId} status updated.`,
      )
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to update the order status.',
      )
    } finally {
      setUpdatingOrderStatus(false)
    }
  }

  async function assignChef(
      orderItemId: number,
      chefId: number,
  ) {
    try {
      setUpdatingItemId(orderItemId)
      setWaiterError('')
      setWaiterActionMessage('')

      const response = await fetch(
          `${API_BASE_URL}/order-items/${orderItemId}/chef/${chefId}`,
          {
            method: 'PUT',
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to assign chef.',
        )
      }

      if (selectedWaiterOrder) {
        await loadWaiterOrder(
            selectedWaiterOrder.id,
        )
      }

      setWaiterActionMessage(
          'Chef assigned successfully.',
      )
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to assign chef.',
      )
    } finally {
      setUpdatingItemId(null)
    }
  }

  async function assignBartender(
      orderItemId: number,
      bartenderId: number,
  ) {
    try {
      setUpdatingItemId(orderItemId)
      setWaiterError('')
      setWaiterActionMessage('')

      const response = await fetch(
          `${API_BASE_URL}/order-items/${orderItemId}/bartender/${bartenderId}`,
          {
            method: 'PUT',
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to assign bartender.',
        )
      }

      if (selectedWaiterOrder) {
        await loadWaiterOrder(
            selectedWaiterOrder.id,
        )
      }

      setWaiterActionMessage(
          'Bartender assigned successfully.',
      )
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to assign bartender.',
      )
    } finally {
      setUpdatingItemId(null)
    }
  }

  async function updatePreparationStatus(
      orderItemId: number,
      preparationStatus: PreparationStatus,
  ) {
    try {
      setUpdatingItemId(orderItemId)
      setWaiterError('')
      setWaiterActionMessage('')

      const response = await fetch(
          `${API_BASE_URL}/order-items/${orderItemId}/preparation-status?preparationStatus=${preparationStatus}`,
          {
            method: 'PUT',
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to update preparation status.',
        )
      }

      if (selectedWaiterOrder) {
        await loadWaiterOrder(
            selectedWaiterOrder.id,
        )
      }

      setWaiterActionMessage(
          `Preparation status changed to ${getPreparationLabel(preparationStatus)}.`,
      )
    } catch (err) {
      setWaiterError(
          err instanceof Error
              ? err.message
              : 'Unable to update preparation status.',
      )
    } finally {
      setUpdatingItemId(null)
    }
  }

  async function payForOrder() {
    if (!currentOrder || currentOrder.status !== 'SERVED') {
      return
    }

    try {
      setProcessingPayment(true)
      setError('')
      setSuccessMessage('')

      const createResponse = await fetch(
          `${API_BASE_URL}/payments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: currentOrder.id,
            }),
          },
      )

      const createData =
          await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(
            createData.message ||
            'Unable to create the payment.',
        )
      }

      const payment: PaymentResponse = createData

      const processResponse = await fetch(
          `${API_BASE_URL}/payments/${payment.id}/process`,
          {
            method: 'PUT',
          },
      )

      const processData =
          await processResponse.json()

      if (!processResponse.ok) {
        throw new Error(
            processData.message ||
            'Unable to process the payment.',
        )
      }

      await refreshCurrentOrder(
          currentOrder.id,
          true,
      )

      setSuccessMessage(
          `Pretend payment of ${formatCurrency(currentOrder.totalAmount)} was recorded successfully.`,
      )
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Unable to complete the payment.',
      )
    } finally {
      setProcessingPayment(false)
    }
  }

  async function submitComplaint() {
    if (!currentOrder || !feedbackComment.trim()) {
      return
    }

    try {
      setSubmittingComplaint(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(
          `${API_BASE_URL}/complaints`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: currentOrder.id,
              comment: feedbackComment.trim(),
            }),
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to submit the complaint.',
        )
      }

      setComplaintSubmitted(true)
      setFeedbackComment('')
      setSuccessMessage(
          `Your complaint for Order #${currentOrder.id} has been submitted.`,
      )
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Unable to submit the complaint.',
      )
    } finally {
      setSubmittingComplaint(false)
    }
  }

  async function submitRating() {
    if (
        !currentOrder ||
        ratingScore === null
    ) {
      return
    }

    try {
      setSubmittingRating(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(
          `${API_BASE_URL}/ratings`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: currentOrder.id,
              score: ratingScore,
              comment: ratingComment.trim(),
            }),
          },
      )

      const responseData =
          await response.json()

      if (!response.ok) {
        throw new Error(
            responseData.message ||
            'Unable to submit the rating.',
        )
      }

      setRatingSubmitted(true)
      setRatingScore(null)
      setRatingComment('')
      setSuccessMessage(
          `Your ${ratingScore}-star rating for Order #${currentOrder.id} has been submitted.`,
      )
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Unable to submit the rating.',
      )
    } finally {
      setSubmittingRating(false)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat(
        'en-NG',
        {
          style: 'currency',
          currency: 'NGN',
          maximumFractionDigits: 0,
        },
    ).format(amount)
  }

  function formatOrderTime(
      orderDate: string,
  ) {
    if (!orderDate) {
      return '—'
    }

    return new Intl.DateTimeFormat(
        'en-NG',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
    ).format(new Date(parseBackendDateTime(orderDate)))
  }

  function formatOrderDate(
      orderDate: string,
  ) {
    if (!orderDate) {
      return '—'
    }

    return new Intl.DateTimeFormat(
        'en-NG',
        {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        },
    ).format(new Date(parseBackendDateTime(orderDate)))
  }

  function getStatusLabel(
      status: string,
  ) {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'PREPARING':
        return 'Preparing'
      case 'SERVED':
        return 'Served'
      case 'PAID':
        return 'Paid'
      default:
        return status
    }
  }

  function getStatusDescription(
      status: string,
  ) {
    switch (status) {
      case 'PENDING':
        return 'Your order has been received and is waiting to be prepared.'
      case 'PREPARING':
        return 'The kitchen and bar are working on your order.'
      case 'SERVED':
        return 'Your order has been served. Enjoy your meal!'
      case 'PAID':
        return 'Payment has been recorded. Thank you for dining with Chowly!'
      default:
        return 'Your order is being processed.'
    }
  }

  function getStatusStep(
      status: string,
  ) {
    switch (status) {
      case 'PENDING':
        return 1
      case 'PREPARING':
        return 2
      case 'SERVED':
        return 3
      case 'PAID':
        return 4
      default:
        return 1
    }
  }

  function getPreparationLabel(
      status: PreparationStatus,
  ) {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'PREPARING':
        return 'Preparing'
      case 'READY':
        return 'Ready'
      default:
        return status
    }
  }

  function getPreparationStep(
      status: PreparationStatus,
  ) {
    switch (status) {
      case 'PENDING':
        return 1
      case 'PREPARING':
        return 2
      case 'READY':
        return 3
      default:
        return 1
    }
  }

  function startNewOrder() {
    setCurrentOrder(null)
    setSuccessMessage('')
    setError('')
    setCart([])
    setSelectedTable('')
  }

  function getOrderStatusBackground(
      status: OrderStatus,
  ) {
    switch (status) {
      case 'PENDING':
        return '#fff7df'
      case 'PREPARING':
        return '#eaf3ff'
      case 'SERVED':
        return '#eaf7ec'
      case 'PAID':
        return '#eaf7ec'
      default:
        return '#f2f4f1'
    }
  }

  function getOrderStatusColor(
      status: OrderStatus,
  ) {
    switch (status) {
      case 'PENDING':
        return '#87651d'
      case 'PREPARING':
        return '#315e8a'
      case 'SERVED':
        return '#28623b'
      case 'PAID':
        return '#28623b'
      default:
        return '#667169'
    }
  }

  return (
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              C
            </div>

            <div>
              <div className="brand-name">
                Chowly
              </div>

              <div className="brand-tagline">
                Good food. Less waiting.
              </div>
            </div>
          </div>

          <div className="role-switch">
          <span className="role-label">
            View as
          </span>

            <div className="role-buttons">
              <button
                  type="button"
                  className={
                    role === 'CUSTOMER'
                        ? 'role-button active'
                        : 'role-button'
                  }
                  onClick={() =>
                      setRole('CUSTOMER')
                  }
              >
                Customer
              </button>

              <button
                  type="button"
                  className={
                    role === 'WAITER'
                        ? 'role-button active'
                        : 'role-button'
                  }
                  onClick={() =>
                      setRole('WAITER')
                  }
              >
                Waiter
              </button>
            </div>
          </div>
        </header>

        {role === 'CUSTOMER' ? (
            <main className="customer-page">
              <section className="hero-section">
                <div className="hero-content">
              <span className="eyebrow">
                WELCOME TO CHOWLY
              </span>

                  <h1>
                    Order what you love.
                    <br />
                    <span>
                  We’ll handle the waiting.
                </span>
                  </h1>

                  <p>
                    Browse the menu, build your
                    order, and see your estimated
                    preparation time before you
                    order.
                  </p>
                </div>

                <div className="hero-card">
                  <div className="hero-card-icon">
                    ⏱
                  </div>

                  <div>
                    <strong>
                      Smart wait estimates
                    </strong>

                    <span>
                  Your wait is based on the
                  slowest item in your order.
                </span>
                  </div>
                </div>
              </section>

              {error && (
                  <div className="alert error-alert">
                    <span>!</span>

                    <div>
                      <strong>
                        Something went wrong
                      </strong>

                      <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        aria-label="Dismiss error"
                    >
                      ×
                    </button>
                  </div>
              )}

              {successMessage &&
                  currentOrder && (
                      <div className="alert success-alert">
                        <span>✓</span>

                        <div>
                          <strong>
                            {successMessage}
                          </strong>

                          <p>
                            Estimated preparation
                            time:{' '}
                            {
                              currentOrder.estimatedWaitTime
                            }{' '}
                            minutes.
                          </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccessMessage('')
                            }
                            aria-label="Dismiss success message"
                        >
                          ×
                        </button>
                      </div>
                  )}

              {currentOrder && (
                  <section
                      className="order-tracking-section"
                      style={{
                        marginBottom: '48px',
                      }}
                  >
                    <div
                        className="tracking-card"
                        style={{
                          background: '#ffffff',
                          border:
                              '1px solid #e1e8e1',
                          borderRadius: '28px',
                          padding: '32px',
                          boxShadow:
                              '0 18px 50px rgba(24, 32, 27, 0.06)',
                        }}
                    >
                      <div
                          style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'flex-start',
                            gap: '24px',
                            flexWrap: 'wrap',
                          }}
                      >
                        <div>
                    <span className="section-kicker">
                      YOUR ACTIVE ORDER
                    </span>

                          <h2
                              style={{
                                margin:
                                    '8px 0 8px',
                              }}
                          >
                            Order #
                            {currentOrder.id}
                          </h2>

                          <p
                              style={{
                                margin: 0,
                                color: '#6c766f',
                              }}
                          >
                            Table{' '}
                            {
                              currentOrder.tableNumber
                            }
                            {' · '}
                            {
                                currentOrder.items
                                    ?.length || 0
                            }{' '}
                            {currentOrder.items
                                ?.length === 1
                                ? 'item'
                                : 'items'}
                          </p>
                        </div>

                        <div
                            style={{
                              display: 'flex',
                              alignItems:
                                  'center',
                              gap: '10px',
                            }}
                        >
                          <div
                              style={{
                                padding:
                                    '10px 16px',
                                borderRadius:
                                    '999px',
                                background:
                                    '#eaf4ed',
                                color: '#185239',
                                fontWeight: 800,
                                fontSize: '14px',
                              }}
                          >
                            {getStatusLabel(
                                currentOrder.status,
                            )}
                          </div>

                          <button
                              type="button"
                              onClick={() =>
                                  refreshCurrentOrder(
                                      currentOrder.id,
                                  )
                              }
                              disabled={
                                refreshingOrder
                              }
                              style={{
                                border:
                                    '1px solid #dce4dd',
                                background:
                                    '#ffffff',
                                borderRadius:
                                    '12px',
                                padding:
                                    '10px 14px',
                                fontWeight: 700,
                                color: '#304037',
                              }}
                          >
                            {refreshingOrder
                                ? 'Refreshing...'
                                : '↻ Refresh'}
                          </button>
                        </div>
                      </div>

                      <div
                          style={{
                            marginTop: '28px',
                            padding: '22px',
                            borderRadius:
                                '20px',
                            background:
                                '#f4f8f4',
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap: '20px',
                            flexWrap: 'wrap',
                          }}
                      >
                        <div>
                    <span
                        style={{
                          display:
                              'block',
                          fontSize:
                              '12px',
                          fontWeight: 800,
                          letterSpacing:
                              '0.12em',
                          textTransform:
                              'uppercase',
                          color: '#56806a',
                          marginBottom:
                              '7px',
                        }}
                    >
                      CURRENT STATUS
                    </span>

                          <strong
                              style={{
                                display:
                                    'block',
                                fontSize:
                                    '22px',
                                color:
                                    '#17231b',
                              }}
                          >
                            {getStatusLabel(
                                currentOrder.status,
                            )}
                          </strong>

                          <span
                              style={{
                                display:
                                    'block',
                                marginTop:
                                    '5px',
                                color:
                                    '#647169',
                              }}
                          >
                      {getStatusDescription(
                          currentOrder.status,
                      )}
                    </span>
                        </div>

                        <div
                            style={{
                              textAlign: 'right',
                            }}
                        >
                    <span
                        style={{
                          display:
                              'block',
                          fontSize:
                              '12px',
                          fontWeight: 800,
                          letterSpacing:
                              '0.12em',
                          textTransform:
                              'uppercase',
                          color: '#56806a',
                          marginBottom:
                              '7px',
                        }}
                    >
                      ESTIMATED WAIT
                    </span>

                          <strong
                              style={{
                                fontSize: '28px',
                                color:
                                    remainingWaitTime < 0
                                        ? '#c0392b'
                                        : '#17231b',
                              }}
                          >
                            {formatRemainingWaitTime(
                                remainingWaitTime,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div
                          style={{
                            marginTop:
                                '34px',
                          }}
                      >
                        <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                  'repeat(4, 1fr)',
                              gap: '10px',
                            }}
                        >
                          {[
                            'PENDING',
                            'PREPARING',
                            'SERVED',
                            'PAID',
                          ].map(
                              (
                                  status,
                                  index,
                              ) => {
                                const step =
                                    index + 1

                                const currentStep =
                                    getStatusStep(
                                        currentOrder.status,
                                    )

                                const completed =
                                    step <=
                                    currentStep

                                return (
                                    <div
                                        key={status}
                                    >
                                      <div
                                          style={{
                                            height:
                                                '7px',
                                            borderRadius:
                                                '999px',
                                            background:
                                                completed
                                                    ? '#185239'
                                                    : '#e2e8e3',
                                          }}
                                      />

                                      <div
                                          style={{
                                            marginTop:
                                                '12px',
                                            fontSize:
                                                '12px',
                                            fontWeight:
                                                completed
                                                    ? 800
                                                    : 600,
                                            color:
                                                completed
                                                    ? '#185239'
                                                    : '#7b857e',
                                          }}
                                      >
                                        {getStatusLabel(
                                            status,
                                        )}
                                      </div>
                                    </div>
                                )
                              },
                          )}
                        </div>
                      </div>

                      <div
                          style={{
                            marginTop:
                                '32px',
                            borderTop:
                                '1px solid #e6ebe7',
                            paddingTop:
                                '24px',
                          }}
                      >
                        <h3
                            style={{
                              margin:
                                  '0 0 18px',
                              fontSize:
                                  '18px',
                            }}
                        >
                          Order details
                        </h3>

                        <div
                            style={{
                              display:
                                  'grid',
                              gap: '12px',
                            }}
                        >
                          {(
                              currentOrder.items ||
                              []
                          ).map(
                              (item) => (
                                  <div
                                      key={
                                        item.id
                                      }
                                      style={{
                                        display:
                                            'flex',
                                        justifyContent:
                                            'space-between',
                                        alignItems:
                                            'center',
                                        gap: '16px',
                                        padding:
                                            '14px 0',
                                        borderBottom:
                                            '1px solid #edf0ed',
                                      }}
                                  >
                                    <div>
                                      <strong>
                                        {
                                          item.quantity
                                        }{' '}
                                        ×{' '}
                                        {
                                          item.menuItemName
                                        }
                                      </strong>

                                      <span
                                          style={{
                                            display:
                                                'block',
                                            marginTop:
                                                '4px',
                                            fontSize:
                                                '13px',
                                            color:
                                                '#78827b',
                                          }}
                                      >
                              {item.preparationStatus ===
                              'READY'
                                  ? 'Ready'
                                  : item.preparationStatus ===
                                  'PREPARING'
                                      ? 'Preparing'
                                      : 'Waiting to prepare'}
                            </span>
                                    </div>

                                    <strong>
                                      {formatCurrency(
                                          item.unitPrice *
                                          item.quantity,
                                      )}
                                    </strong>
                                  </div>
                              ),
                          )}
                        </div>

                        <div
                            style={{
                              display:
                                  'flex',
                              justifyContent:
                                  'space-between',
                              alignItems:
                                  'center',
                              marginTop:
                                  '20px',
                            }}
                        >
                    <span
                        style={{
                          fontWeight:
                              700,
                          color:
                              '#667169',
                        }}
                    >
                      Order total
                    </span>

                          <strong
                              style={{
                                fontSize:
                                    '22px',
                              }}
                          >
                            {formatCurrency(
                                currentOrder.totalAmount,
                            )}
                          </strong>
                        </div>
                      </div>

                      {(currentOrder.status ===
                          'SERVED' ||
                          currentOrder.status ===
                          'PAID') && (
                          <div
                              style={{
                                marginTop: '26px',
                                padding: '20px',
                                borderRadius: '16px',
                                background: '#f7f8f6',
                                border: '1px solid #dfe6df',
                              }}
                          >
                            <div>
                              <span
                                  style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: '#56806a',
                                    marginBottom: '7px',
                                  }}
                              >
                                FEEDBACK
                              </span>

                              <strong
                                  style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    color: '#17231b',
                                  }}
                              >
                                Was your order seriously delayed?
                              </strong>

                              <p
                                  style={{
                                    margin: '6px 0 0',
                                    color: '#667169',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                  }}
                              >
                                Tell us what went wrong and rate your
                                experience. Your feedback is saved with
                                this order.
                              </p>
                            </div>

                            <div
                                style={{
                                  marginTop: '18px',
                                  paddingTop: '18px',
                                  borderTop: '1px solid #e1e6e1',
                                }}
                            >
                              <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '8px',
                                  }}
                              >
                                <strong
                                    style={{
                                      fontSize: '13px',
                                      color: '#314138',
                                    }}
                                >
                                  Complaint
                                </strong>

                                {complaintSubmitted && (
                                    <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          color: '#28623b',
                                        }}
                                    >
                                      Submitted
                                    </span>
                                )}
                              </div>

                              {!complaintSubmitted ? (
                                  <>
                                    <textarea
                                        value={feedbackComment}
                                        onChange={(event) =>
                                            setFeedbackComment(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe the serious delay or what went wrong..."
                                        rows={3}
                                        style={{
                                          width: '100%',
                                          resize: 'vertical',
                                          border: '1px solid #dce4dd',
                                          borderRadius: '10px',
                                          padding: '11px 12px',
                                          outline: 'none',
                                          background: '#ffffff',
                                          color: '#243128',
                                          fontSize: '13px',
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={submitComplaint}
                                        disabled={
                                            submittingComplaint ||
                                            !feedbackComment.trim()
                                        }
                                        style={{
                                          marginTop: '9px',
                                          border: 'none',
                                          borderRadius: '10px',
                                          padding: '10px 14px',
                                          background: '#173b2b',
                                          color: '#ffffff',
                                          fontWeight: 800,
                                          fontSize: '11px',
                                          opacity:
                                              submittingComplaint ||
                                              !feedbackComment.trim()
                                                  ? 0.55
                                                  : 1,
                                        }}
                                    >
                                      {submittingComplaint
                                          ? 'Submitting...'
                                          : 'Submit complaint'}
                                    </button>
                                  </>
                              ) : (
                                  <p
                                      style={{
                                        margin: 0,
                                        color: '#4d6b55',
                                        fontSize: '12px',
                                      }}
                                  >
                                    Your complaint has been recorded for
                                    this order.
                                  </p>
                              )}
                            </div>

                            <div
                                style={{
                                  marginTop: '20px',
                                  paddingTop: '18px',
                                  borderTop: '1px solid #e1e6e1',
                                }}
                            >
                              <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '8px',
                                  }}
                              >
                                <strong
                                    style={{
                                      fontSize: '13px',
                                      color: '#314138',
                                    }}
                                >
                                  Rate your experience
                                </strong>

                                {ratingSubmitted && (
                                    <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          color: '#28623b',
                                        }}
                                    >
                                      Submitted
                                    </span>
                                )}
                              </div>

                              {!ratingSubmitted ? (
                                  <>
                                    <div
                                        style={{
                                          display: 'flex',
                                          gap: '7px',
                                          flexWrap: 'wrap',
                                          marginBottom: '10px',
                                        }}
                                    >
                                      {[1, 2, 3, 4, 5].map(
                                          (score) => (
                                              <button
                                                  key={score}
                                                  type="button"
                                                  onClick={() =>
                                                      setRatingScore(score)
                                                  }
                                                  aria-label={`${score} star rating`}
                                                  style={{
                                                    minWidth: '38px',
                                                    height: '38px',
                                                    borderRadius: '10px',
                                                    border:
                                                        ratingScore ===
                                                        score
                                                            ? '2px solid #185239'
                                                            : '1px solid #dce4dd',
                                                    background:
                                                        ratingScore ===
                                                        score
                                                            ? '#edf5ef'
                                                            : '#ffffff',
                                                    color:
                                                        ratingScore ===
                                                        score
                                                            ? '#185239'
                                                            : '#667169',
                                                    fontWeight: 800,
                                                    fontSize: '12px',
                                                  }}
                                              >
                                                {score}★
                                              </button>
                                          ),
                                      )}
                                    </div>

                                    <textarea
                                        value={ratingComment}
                                        onChange={(event) =>
                                            setRatingComment(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Optional rating comment..."
                                        rows={2}
                                        style={{
                                          width: '100%',
                                          resize: 'vertical',
                                          border: '1px solid #dce4dd',
                                          borderRadius: '10px',
                                          padding: '11px 12px',
                                          outline: 'none',
                                          background: '#ffffff',
                                          color: '#243128',
                                          fontSize: '13px',
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={submitRating}
                                        disabled={
                                            submittingRating ||
                                            ratingScore === null
                                        }
                                        style={{
                                          marginTop: '9px',
                                          border: '1px solid #185239',
                                          borderRadius: '10px',
                                          padding: '10px 14px',
                                          background: '#ffffff',
                                          color: '#185239',
                                          fontWeight: 800,
                                          fontSize: '11px',
                                          opacity:
                                              submittingRating ||
                                              ratingScore === null
                                                  ? 0.55
                                                  : 1,
                                        }}
                                    >
                                      {submittingRating
                                          ? 'Submitting...'
                                          : 'Submit rating'}
                                    </button>
                                  </>
                              ) : (
                                  <p
                                      style={{
                                        margin: 0,
                                        color: '#4d6b55',
                                        fontSize: '12px',
                                      }}
                                  >
                                    Thank you. Your rating has been
                                    recorded for this order.
                                  </p>
                              )}
                            </div>
                          </div>
                      )}

                      {currentOrder.status ===
                          'SERVED' && (
                              <div
                                  style={{
                                    marginTop:
                                        '26px',
                                    padding:
                                        '20px',
                                    borderRadius:
                                        '16px',
                                    background:
                                        '#fff8e8',
                                    border:
                                        '1px solid #f0dfad',
                                  }}
                              >
                                <div
                                    style={{
                                      display: 'flex',
                                      justifyContent:
                                          'space-between',
                                      alignItems: 'center',
                                      gap: '18px',
                                      flexWrap: 'wrap',
                                    }}
                                >
                                  <div>
                                    <strong>
                                      Your order has been served.
                                    </strong>

                                    <p
                                        style={{
                                          margin: '5px 0 0',
                                          color: '#74613a',
                                        }}
                                    >
                                      Payment is required before you
                                      finish your visit.
                                    </p>
                                  </div>

                                  <button
                                      type="button"
                                      onClick={payForOrder}
                                      disabled={processingPayment}
                                      style={{
                                        border: 'none',
                                        borderRadius: '11px',
                                        padding: '12px 18px',
                                        background: '#173b2b',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                        opacity: processingPayment ? 0.65 : 1,
                                      }}
                                  >
                                    {processingPayment
                                        ? 'Processing payment...'
                                        : `Pay ${formatCurrency(currentOrder.totalAmount)}`}
                                  </button>
                                </div>

                                <div
                                    style={{
                                      marginTop: '14px',
                                      paddingTop: '12px',
                                      borderTop: '1px solid #f0dfad',
                                      color: '#806b42',
                                      fontSize: '11px',
                                      lineHeight: 1.5,
                                    }}
                                >
                                  <strong>PRETEND PAYMENT</strong>
                                  <span> — This is a simulated payment for the assignment. No real money will be charged.</span>
                                </div>
                              </div>
                          )}

                      {currentOrder.status ===
                          'PAID' && (
                              <div
                                  style={{
                                    marginTop:
                                        '26px',
                                    padding:
                                        '18px 20px',
                                    borderRadius:
                                        '16px',
                                    background:
                                        '#eaf7ec',
                                    border:
                                        '1px solid #cce5d1',
                                  }}
                              >
                                <strong>
                                  Payment complete.
                                </strong>

                                <p
                                    style={{
                                      margin:
                                          '5px 0 0',
                                      color:
                                          '#4d6b55',
                                    }}
                                >
                                  Thank you for using
                                  Chowly.
                                </p>
                              </div>
                          )}

                      <div
                          style={{
                            marginTop:
                                '26px',
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap: '16px',
                            flexWrap:
                                'wrap',
                          }}
                      >
                  <span
                      style={{
                        color:
                            '#7a837d',
                        fontSize:
                            '13px',
                      }}
                  >
                    Status updates
                    automatically
                    every 5 seconds.
                  </span>

                        <button
                            type="button"
                            onClick={
                              startNewOrder
                            }
                            style={{
                              border:
                                  'none',
                              background:
                                  '#185239',
                              color:
                                  '#ffffff',
                              borderRadius:
                                  '12px',
                              padding:
                                  '12px 18px',
                              fontWeight:
                                  800,
                            }}
                        >
                          Start a new order
                        </button>
                      </div>
                    </div>
                  </section>
              )}

              <section className="ordering-layout">
                <div className="menu-area">
                  <div className="section-heading">
                    <div>
                  <span className="section-kicker">
                    THE MENU
                  </span>

                      <h2>
                        Choose your favourites
                      </h2>
                    </div>

                    <div className="menu-count">
                      {filteredMenu.length}{' '}
                      items
                    </div>
                  </div>

                  <div className="category-tabs">
                    <button
                        type="button"
                        className={
                          activeCategory ===
                          'ALL'
                              ? 'category-tab active'
                              : 'category-tab'
                        }
                        onClick={() =>
                            setActiveCategory(
                                'ALL',
                            )
                        }
                    >
                      All
                    </button>

                    <button
                        type="button"
                        className={
                          activeCategory ===
                          'FOOD'
                              ? 'category-tab active'
                              : 'category-tab'
                        }
                        onClick={() =>
                            setActiveCategory(
                                'FOOD',
                            )
                        }
                    >
                      Food
                    </button>

                    <button
                        type="button"
                        className={
                          activeCategory ===
                          'DRINK'
                              ? 'category-tab active'
                              : 'category-tab'
                        }
                        onClick={() =>
                            setActiveCategory(
                                'DRINK',
                            )
                        }
                    >
                      Drinks
                    </button>
                  </div>

                  {loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>
                          Loading the menu...
                        </p>
                      </div>
                  ) : filteredMenu.length ===
                  0 ? (
                      <div className="empty-state">
                        <div>🍽</div>

                        <h3>
                          No menu items
                          available
                        </h3>

                        <p>
                          Please check back
                          shortly.
                        </p>
                      </div>
                  ) : (
                      <div className="menu-grid">
                        {filteredMenu.map(
                            (item) => {
                              const cartItem =
                                  cart.find(
                                      (
                                          cartEntry,
                                      ) =>
                                          cartEntry
                                              .menuItem
                                              .id ===
                                          item.id,
                                  )

                              return (
                                  <article
                                      className={
                                        item.availability
                                            ? 'menu-card'
                                            : 'menu-card unavailable'
                                      }
                                      key={item.id}
                                  >
                                    <div className="menu-card-top">
                                      <div className="menu-icon">
                                        {item.type ===
                                        'FOOD'
                                            ? '🍽'
                                            : '🥤'}
                                      </div>

                                      <span className="item-type">
                              {item.type ===
                              'FOOD'
                                  ? 'Food'
                                  : 'Drink'}
                            </span>
                                    </div>

                                    <div className="menu-card-body">
                                      <h3>
                                        {item.name}
                                      </h3>

                                      <div className="item-details">
                              <span>
                                ⏱{' '}
                                {
                                  item.preparationTime
                                }{' '}
                                min
                              </span>

                                        <span>
                                {item.availability
                                    ? 'Available'
                                    : 'Unavailable'}
                              </span>
                                      </div>

                                      <div className="menu-card-bottom">
                                        <strong>
                                          {formatCurrency(
                                              item.price,
                                          )}
                                        </strong>

                                        {item.availability ? (
                                            cartItem ? (
                                                <div className="mini-quantity">
                                                  <button
                                                      type="button"
                                                      onClick={() =>
                                                          decreaseQuantity(
                                                              item.id,
                                                          )
                                                      }
                                                      aria-label={`Decrease ${item.name}`}
                                                  >
                                                    −
                                                  </button>

                                                  <span>
                                      {
                                        cartItem.quantity
                                      }
                                    </span>

                                                  <button
                                                      type="button"
                                                      onClick={() =>
                                                          increaseQuantity(
                                                              item.id,
                                                          )
                                                      }
                                                      aria-label={`Increase ${item.name}`}
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="add-button"
                                                    onClick={() =>
                                                        addToCart(
                                                            item,
                                                        )
                                                    }
                                                >
                                                  Add
                                                </button>
                                            )
                                        ) : (
                                            <span className="unavailable-label">
                                  Unavailable
                                </span>
                                        )}
                                      </div>
                                    </div>
                                  </article>
                              )
                            },
                        )}
                      </div>
                  )}
                </div>

                <aside className="order-panel">
                  <div className="order-panel-header">
                    <div>
                  <span className="section-kicker">
                    YOUR ORDER
                  </span>

                      <h2>
                        Order summary
                      </h2>
                    </div>

                    {cartItemCount >
                        0 && (
                            <span className="cart-badge">
                    {cartItemCount}
                  </span>
                        )}
                  </div>

                  <div className="table-selector">
                    <label htmlFor="table">
                      <span>Table</span>

                      <small>
                        Where should we
                        bring your order?
                      </small>
                    </label>

                    <select
                        id="table"
                        value={
                          selectedTable
                        }
                        onChange={(
                            event,
                        ) =>
                            setSelectedTable(
                                event.target
                                    .value ===
                                ''
                                    ? ''
                                    : Number(
                                        event.target
                                            .value,
                                    ),
                            )
                        }
                    >
                      <option value="">
                        Select a table
                      </option>

                      {tables.map(
                          (table) => (
                              <option
                                  key={
                                    table.id
                                  }
                                  value={
                                    table.id
                                  }
                              >
                                Table{' '}
                                {
                                  table.number
                                }{' '}
                                ·{' '}
                                {
                                  table.capacity
                                }{' '}
                                seats
                              </option>
                          ),
                      )}
                    </select>
                  </div>

                  <div className="order-items">
                    {cart.length ===
                    0 ? (
                        <div className="cart-empty">
                          <div className="cart-empty-icon">
                            🛒
                          </div>

                          <h3>
                            Your order is
                            empty
                          </h3>

                          <p>
                            Add something
                            delicious from
                            the menu.
                          </p>
                        </div>
                    ) : (
                        cart.map(
                            (item) => (
                                <div
                                    className="cart-item"
                                    key={
                                      item
                                          .menuItem
                                          .id
                                    }
                                >
                                  <div className="cart-item-info">
                                    <strong>
                                      {
                                        item
                                            .menuItem
                                            .name
                                      }
                                    </strong>

                                    <span>
                            {formatCurrency(
                                item
                                    .menuItem
                                    .price,
                            )}{' '}
                                      each
                          </span>
                                  </div>

                                  <div className="cart-item-actions">
                                    <div className="quantity-control">
                                      <button
                                          type="button"
                                          onClick={() =>
                                              decreaseQuantity(
                                                  item
                                                      .menuItem
                                                      .id,
                                              )
                                          }
                                          aria-label={`Decrease ${item.menuItem.name}`}
                                      >
                                        −
                                      </button>

                                      <span>
                              {
                                item.quantity
                              }
                            </span>

                                      <button
                                          type="button"
                                          onClick={() =>
                                              increaseQuantity(
                                                  item
                                                      .menuItem
                                                      .id,
                                              )
                                          }
                                          aria-label={`Increase ${item.menuItem.name}`}
                                      >
                                        +
                                      </button>
                                    </div>

                                    <strong>
                                      {formatCurrency(
                                          item
                                              .menuItem
                                              .price *
                                          item.quantity,
                                      )}
                                    </strong>

                                    <button
                                        type="button"
                                        className="remove-button"
                                        onClick={() =>
                                            removeFromCart(
                                                item
                                                    .menuItem
                                                    .id,
                                            )
                                        }
                                        aria-label={`Remove ${item.menuItem.name}`}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                            ),
                        )
                    )}
                  </div>

                  <div className="order-summary">
                    <div>
                  <span>
                    Items
                  </span>

                      <strong>
                        {cartItemCount}
                      </strong>
                    </div>

                    <div>
                  <span>
                    Estimated wait
                  </span>

                      <strong>
                        {estimatedWait >
                        0
                            ? `${estimatedWait} min`
                            : '—'}
                      </strong>
                    </div>

                    <div className="total-row">
                  <span>
                    Total
                  </span>

                      <strong>
                        {formatCurrency(
                            cartTotal,
                        )}
                      </strong>
                    </div>
                  </div>

                  <button
                      type="button"
                      className="place-order-button"
                      onClick={
                        placeOrder
                      }
                      disabled={
                          placingOrder ||
                          cart.length ===
                          0 ||
                          selectedTable ===
                          ''
                      }
                  >
                    {placingOrder
                        ? 'Placing order...'
                        : 'Place order'}

                    {!placingOrder && (
                        <span>→</span>
                    )}
                  </button>

                  <p className="payment-note">
                    Payment is handled
                    after your order is
                    served.
                  </p>
                </aside>
              </section>
            </main>
        ) : (
            <main
                style={{
                  width: 'min(1440px, 100%)',
                  margin: '0 auto',
                  padding:
                      '48px 5vw 70px',
                }}
            >
              {/* WAITER DASHBOARD HEADER */}
              <section
                  style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems:
                        'flex-end',
                    gap: '24px',
                    marginBottom:
                        '30px',
                    flexWrap: 'wrap',
                  }}
              >
                <div>
              <span className="section-kicker">
                WAITER VIEW
              </span>

                  <h1
                      style={{
                        margin:
                            '8px 0 10px',
                        fontSize:
                            'clamp(36px, 4vw, 54px)',
                        lineHeight: 1,
                        letterSpacing:
                            '-0.05em',
                        color:
                            '#14221a',
                      }}
                  >
                    Orders at a glance.
                  </h1>

                  <p
                      style={{
                        margin: 0,
                        color: '#69736b',
                        fontSize: '15px',
                      }}
                  >
                    Manage incoming orders,
                    assign preparation staff,
                    and serve completed
                    orders.
                  </p>
                </div>

                <button
                    type="button"
                    onClick={
                      refreshWaiterData
                    }
                    disabled={
                      waiterLoading
                    }
                    style={{
                      border:
                          '1px solid #dce4dd',
                      background:
                          '#ffffff',
                      borderRadius:
                          '12px',
                      padding:
                          '12px 17px',
                      color:
                          '#304037',
                      fontWeight: 800,
                    }}
                >
                  {waiterLoading
                      ? 'Refreshing...'
                      : '↻ Refresh orders'}
                </button>
              </section>

              {/* WAITER SUMMARY CARDS */}
              <section
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                    gap: '16px',
                    marginBottom:
                        '28px',
                  }}
              >
                {[
                  {
                    label:
                        'Awaiting preparation',
                    value:
                    waiterPendingCount,
                    detail:
                        'New orders',
                  },
                  {
                    label:
                        'Being prepared',
                    value:
                    waiterPreparingCount,
                    detail:
                        'Kitchen & bar',
                  },
                  {
                    label:
                        'Completed',
                    value:
                    waiterServedCount,
                    detail:
                        'Served or paid',
                  },
                ].map(
                    (card) => (
                        <div
                            key={card.label}
                            style={{
                              padding:
                                  '22px 24px',
                              border:
                                  '1px solid #e0e6df',
                              borderRadius:
                                  '18px',
                              background:
                                  '#ffffff',
                              boxShadow:
                                  '0 8px 25px rgba(29, 42, 33, 0.04)',
                            }}
                        >
                  <span
                      style={{
                        display:
                            'block',
                        color:
                            '#728077',
                        fontSize:
                            '11px',
                        fontWeight:
                            800,
                        letterSpacing:
                            '0.1em',
                        textTransform:
                            'uppercase',
                      }}
                  >
                    {card.label}
                  </span>

                          <strong
                              style={{
                                display:
                                    'block',
                                marginTop:
                                    '8px',
                                color:
                                    '#173b2b',
                                fontSize:
                                    '32px',
                                lineHeight: 1,
                              }}
                          >
                            {card.value}
                          </strong>

                          <span
                              style={{
                                display:
                                    'block',
                                marginTop:
                                    '7px',
                                color:
                                    '#909991',
                                fontSize:
                                    '12px',
                              }}
                          >
                    {card.detail}
                  </span>
                        </div>
                    ),
                )}
              </section>

              {waiterError && (
                  <div
                      className="alert error-alert"
                      style={{
                        marginBottom:
                            '20px',
                      }}
                  >
                    <span>!</span>

                    <div>
                      <strong>
                        Something went wrong
                      </strong>

                      <p>
                        {waiterError}
                      </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setWaiterError(
                                '',
                            )
                        }
                        aria-label="Dismiss waiter error"
                    >
                      ×
                    </button>
                  </div>
              )}

              {waiterActionMessage && (
                  <div
                      className="alert success-alert"
                      style={{
                        marginBottom:
                            '20px',
                      }}
                  >
                    <span>✓</span>

                    <div>
                      <strong>
                        Action completed
                      </strong>

                      <p>
                        {
                          waiterActionMessage
                        }
                      </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setWaiterActionMessage(
                                '',
                            )
                        }
                        aria-label="Dismiss waiter message"
                    >
                      ×
                    </button>
                  </div>
              )}

              {/* MAIN WAITER WORKSPACE */}
              <section
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                        '360px minmax(0, 1fr)',
                    gap: '22px',
                    alignItems:
                        'start',
                  }}
              >
                {/* ORDER QUEUE */}
                <div
                    style={{
                      border:
                          '1px solid #dfe5de',
                      borderRadius:
                          '22px',
                      background:
                          '#ffffff',
                      overflow:
                          'hidden',
                      boxShadow:
                          '0 15px 40px rgba(29, 42, 33, 0.06)',
                    }}
                >
                  <div
                      style={{
                        padding:
                            '22px',
                        borderBottom:
                            '1px solid #edf0eb',
                        display:
                            'flex',
                        justifyContent:
                            'space-between',
                        alignItems:
                            'center',
                        gap: '12px',
                      }}
                  >
                    <div>
                  <span className="section-kicker">
                    ORDER QUEUE
                  </span>

                      <h2
                          style={{
                            margin:
                                '5px 0 0',
                            fontSize:
                                '23px',
                            letterSpacing:
                                '-0.03em',
                          }}
                      >
                        Incoming orders
                      </h2>
                    </div>

                    <span
                        style={{
                          minWidth:
                              '30px',
                          height:
                              '30px',
                          padding:
                              '0 9px',
                          display:
                              'grid',
                          placeItems:
                              'center',
                          borderRadius:
                              '50%',
                          background:
                              '#173b2b',
                          color:
                              '#ffffff',
                          fontSize:
                              '12px',
                          fontWeight:
                              800,
                        }}
                    >
                  {
                    waiterOrders.length
                  }
                </span>
                  </div>

                  <div
                      style={{
                        maxHeight:
                            '650px',
                        overflowY:
                            'auto',
                      }}
                  >
                    {waiterLoading &&
                    waiterOrders.length ===
                    0 ? (
                        <div
                            style={{
                              padding:
                                  '50px 24px',
                              textAlign:
                                  'center',
                              color:
                                  '#818b83',
                            }}
                        >
                          Loading orders...
                        </div>
                    ) : waiterOrders.length ===
                    0 ? (
                        <div
                            style={{
                              padding:
                                  '55px 24px',
                              textAlign:
                                  'center',
                            }}
                        >
                          <div
                              style={{
                                fontSize:
                                    '32px',
                                marginBottom:
                                    '12px',
                              }}
                          >
                            ✓
                          </div>

                          <strong
                              style={{
                                display:
                                    'block',
                                color:
                                    '#37443a',
                              }}
                          >
                            No orders yet
                          </strong>

                          <span
                              style={{
                                display:
                                    'block',
                                marginTop:
                                    '6px',
                                color:
                                    '#929a93',
                                fontSize:
                                    '12px',
                              }}
                          >
                      New customer
                      orders will
                      appear here.
                    </span>
                        </div>
                    ) : (
                        waiterOrders
                            .slice()
                            .sort(
                                (
                                    a,
                                    b,
                                ) =>
                                    new Date(
                                        b.orderDate,
                                    ).getTime() -
                                    new Date(
                                        a.orderDate,
                                    ).getTime(),
                            )
                            .map(
                                (order) => {
                                  const selected =
                                      selectedWaiterOrderId ===
                                      order.id

                                  return (
                                      <button
                                          type="button"
                                          key={
                                            order.id
                                          }
                                          onClick={() =>
                                              loadWaiterOrder(
                                                  order.id,
                                              )
                                          }
                                          style={{
                                            width:
                                                '100%',
                                            border:
                                                'none',
                                            borderBottom:
                                                '1px solid #edf0eb',
                                            background:
                                                selected
                                                    ? '#f3f7f3'
                                                    : '#ffffff',
                                            padding:
                                                '18px 20px',
                                            textAlign:
                                                'left',
                                            cursor:
                                                'pointer',
                                          }}
                                      >
                                        <div
                                            style={{
                                              display:
                                                  'flex',
                                              justifyContent:
                                                  'space-between',
                                              alignItems:
                                                  'center',
                                              gap:
                                                  '12px',
                                            }}
                                        >
                                          <strong
                                              style={{
                                                color:
                                                    '#1d2a22',
                                                fontSize:
                                                    '15px',
                                              }}
                                          >
                                            Order #
                                            {
                                              order.id
                                            }
                                          </strong>

                                          <span
                                              style={{
                                                padding:
                                                    '5px 9px',
                                                borderRadius:
                                                    '999px',
                                                background:
                                                    getOrderStatusBackground(
                                                        order.status,
                                                    ),
                                                color:
                                                    getOrderStatusColor(
                                                        order.status,
                                                    ),
                                                fontSize:
                                                    '10px',
                                                fontWeight:
                                                    800,
                                              }}
                                          >
                                {getStatusLabel(
                                    order.status,
                                )}
                              </span>
                                        </div>

                                        <div
                                            style={{
                                              display:
                                                  'flex',
                                              justifyContent:
                                                  'space-between',
                                              gap:
                                                  '12px',
                                              marginTop:
                                                  '9px',
                                            }}
                                        >
                              <span
                                  style={{
                                    color:
                                        '#68736b',
                                    fontSize:
                                        '12px',
                                  }}
                              >
                                Table{' '}
                                {
                                  order.tableNumber
                                }{' '}
                                ·{' '}
                                {
                                    order.items
                                        ?.length ||
                                    0
                                }{' '}
                                items
                              </span>

                                          <strong
                                              style={{
                                                color:
                                                    '#173b2b',
                                                fontSize:
                                                    '12px',
                                              }}
                                          >
                                            {formatCurrency(
                                                order.totalAmount,
                                            )}
                                          </strong>
                                        </div>

                                        <div
                                            style={{
                                              display:
                                                  'flex',
                                              justifyContent:
                                                  'space-between',
                                              marginTop:
                                                  '8px',
                                              color:
                                                  '#9aa19b',
                                              fontSize:
                                                  '10px',
                                            }}
                                        >
                              <span
                                  style={{
                                    color:
                                        order.status === 'SERVED' ||
                                        order.status === 'PAID'
                                            ? '#28623b'
                                            : (
                                                waiterRemainingWaitTimes[order.id] ??
                                                getRemainingWaitTime(order)
                                            ) < 0
                                                ? '#c0392b'
                                                : '#9aa19b',
                                    fontWeight:
                                        order.status === 'SERVED' ||
                                        order.status === 'PAID'
                                            ? 800
                                            : 700,
                                  }}
                              >
                                {order.status === 'SERVED' ||
                                order.status === 'PAID'
                                    ? 'Completed'
                                    : `${formatRemainingWaitTime(
                                        waiterRemainingWaitTimes[order.id] ??
                                        getRemainingWaitTime(order),
                                    )} remaining`}
                              </span>

                                          <span>
                                {formatOrderTime(
                                    order.orderDate,
                                )}
                              </span>
                                        </div>
                                      </button>
                                  )
                                },
                            )
                    )}
                  </div>
                </div>

                {/* ORDER DETAILS */}
                <div
                    style={{
                      minWidth:
                          '0',
                      border:
                          '1px solid #dfe5de',
                      borderRadius:
                          '22px',
                      background:
                          '#ffffff',
                      overflow:
                          'hidden',
                      boxShadow:
                          '0 15px 40px rgba(29, 42, 33, 0.06)',
                    }}
                >
                  {!selectedWaiterOrder ? (
                      <div
                          style={{
                            minHeight:
                                '520px',
                            display:
                                'grid',
                            placeItems:
                                'center',
                            textAlign:
                                'center',
                            padding:
                                '50px',
                          }}
                      >
                        <div>
                          <div
                              style={{
                                width:
                                    '62px',
                                height:
                                    '62px',
                                margin:
                                    '0 auto 18px',
                                display:
                                    'grid',
                                placeItems:
                                    'center',
                                borderRadius:
                                    '18px',
                                background:
                                    '#f0f5ef',
                                fontSize:
                                    '28px',
                              }}
                          >
                            ☰
                          </div>

                          <h2
                              style={{
                                margin:
                                    '0 0 8px',
                                fontSize:
                                    '24px',
                              }}
                          >
                            Select an order
                          </h2>

                          <p
                              style={{
                                margin:
                                    '0',
                                color:
                                    '#7a847c',
                                fontSize:
                                    '13px',
                              }}
                          >
                            Choose an order
                            from the queue
                            to view its
                            items and
                            manage
                            preparation.
                          </p>
                        </div>
                      </div>
                  ) : (
                      <>
                        {/* DETAIL HEADER */}
                        <div
                            style={{
                              padding:
                                  '26px 28px',
                              borderBottom:
                                  '1px solid #edf0eb',
                            }}
                        >
                          <div
                              style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'flex-start',
                                gap:
                                    '20px',
                                flexWrap:
                                    'wrap',
                              }}
                          >
                            <div>
                        <span className="section-kicker">
                          ORDER DETAILS
                        </span>

                              <h2
                                  style={{
                                    margin:
                                        '7px 0 7px',
                                    fontSize:
                                        '30px',
                                    letterSpacing:
                                        '-0.04em',
                                  }}
                              >
                                Order #
                                {
                                  selectedWaiterOrder.id
                                }
                              </h2>

                              <p
                                  style={{
                                    margin:
                                        '0',
                                    color:
                                        '#707a72',
                                    fontSize:
                                        '13px',
                                  }}
                              >
                                Table{' '}
                                {
                                  selectedWaiterOrder.tableNumber
                                }{' '}
                                ·{' '}
                                {
                                    selectedWaiterOrder.items
                                        ?.length ||
                                    0
                                }{' '}
                                items ·{' '}
                                {formatOrderDate(
                                    selectedWaiterOrder.orderDate,
                                )}
                              </p>
                            </div>

                            <span
                                style={{
                                  padding:
                                      '9px 14px',
                                  borderRadius:
                                      '999px',
                                  background:
                                      getOrderStatusBackground(
                                          selectedWaiterOrder.status,
                                      ),
                                  color:
                                      getOrderStatusColor(
                                          selectedWaiterOrder.status,
                                      ),
                                  fontWeight:
                                      800,
                                  fontSize:
                                      '12px',
                                }}
                            >
                        {getStatusLabel(
                            selectedWaiterOrder.status,
                        )}
                      </span>
                          </div>

                          <div
                              style={{
                                marginTop:
                                    '22px',
                                display:
                                    'flex',
                                gap:
                                    '10px',
                                flexWrap:
                                    'wrap',
                              }}
                          >
                            {selectedWaiterOrder.status ===
                                'PENDING' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateWaiterOrderStatus(
                                                selectedWaiterOrder.id,
                                                'PREPARING',
                                            )
                                        }
                                        disabled={
                                          updatingOrderStatus
                                        }
                                        style={{
                                          border:
                                              'none',
                                          borderRadius:
                                              '11px',
                                          padding:
                                              '11px 17px',
                                          background:
                                              '#173b2b',
                                          color:
                                              '#ffffff',
                                          fontWeight:
                                              800,
                                          fontSize:
                                              '12px',
                                        }}
                                    >
                                      {updatingOrderStatus
                                          ? 'Updating...'
                                          : 'Start preparing'}
                                    </button>
                                )}

                            {selectedWaiterOrder.status ===
                                'PREPARING' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateWaiterOrderStatus(
                                                selectedWaiterOrder.id,
                                                'SERVED',
                                            )
                                        }
                                        disabled={
                                          updatingOrderStatus
                                        }
                                        style={{
                                          border:
                                              'none',
                                          borderRadius:
                                              '11px',
                                          padding:
                                              '11px 17px',
                                          background:
                                              '#173b2b',
                                          color:
                                              '#ffffff',
                                          fontWeight:
                                              800,
                                          fontSize:
                                              '12px',
                                        }}
                                    >
                                      {updatingOrderStatus
                                          ? 'Updating...'
                                          : 'Mark as served'}
                                    </button>
                                )}

                            {selectedWaiterOrder.status ===
                                'SERVED' && (
                                    <div
                                        style={{
                                          padding:
                                              '11px 16px',
                                          borderRadius:
                                              '11px',
                                          background:
                                              '#edf8ef',
                                          color:
                                              '#28623b',
                                          fontSize:
                                              '12px',
                                          fontWeight:
                                              800,
                                        }}
                                    >
                                      ✓ Served
                                    </div>
                                )}

                            {selectedWaiterOrder.status ===
                                'PAID' && (
                                    <div
                                        style={{
                                          padding:
                                              '11px 16px',
                                          borderRadius:
                                              '11px',
                                          background:
                                              '#edf8ef',
                                          color:
                                              '#28623b',
                                          fontSize:
                                              '12px',
                                          fontWeight:
                                              800,
                                        }}
                                    >
                                      ✓ Paid
                                    </div>
                                )}
                          </div>
                        </div>

                        {/* ORDER META */}
                        <div
                            style={{
                              display:
                                  'grid',
                              gridTemplateColumns:
                                  'repeat(3, minmax(0, 1fr))',
                              borderBottom:
                                  '1px solid #edf0eb',
                            }}
                        >
                          {[
                            {
                              label:
                                  'Estimated wait',
                              value:
                                  selectedWaiterOrder.status === 'SERVED' ||
                                  selectedWaiterOrder.status === 'PAID'
                                      ? 'Completed'
                                      : formatRemainingWaitTime(
                                          waiterRemainingWaitTimes[
                                              selectedWaiterOrder.id
                                              ] ??
                                          getRemainingWaitTime(
                                              selectedWaiterOrder,
                                          ),
                                      ),
                            },
                            {
                              label:
                                  'Order total',
                              value:
                                  formatCurrency(
                                      selectedWaiterOrder.totalAmount,
                                  ),
                            },
                            {
                              label:
                                  'Table',
                              value: `Table ${selectedWaiterOrder.tableNumber}`,
                            },
                          ].map(
                              (meta) => (
                                  <div
                                      key={
                                        meta.label
                                      }
                                      style={{
                                        padding:
                                            '18px 22px',
                                        borderRight:
                                            '1px solid #edf0eb',
                                      }}
                                  >
                          <span
                              style={{
                                display:
                                    'block',
                                color:
                                    '#89928a',
                                fontSize:
                                    '10px',
                                fontWeight:
                                    800,
                                letterSpacing:
                                    '0.1em',
                                textTransform:
                                    'uppercase',
                              }}
                          >
                            {
                              meta.label
                            }
                          </span>

                                    <strong
                                        style={{
                                          display:
                                              'block',
                                          marginTop:
                                              '7px',
                                          color:
                                              '#263329',
                                          fontSize:
                                              '16px',
                                        }}
                                    >
                                      {
                                        meta.value
                                      }
                                    </strong>
                                  </div>
                              ),
                          )}
                        </div>

                        {/* ITEMS */}
                        <div
                            style={{
                              padding:
                                  '26px 28px 32px',
                            }}
                        >
                          <div
                              style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'center',
                                gap:
                                    '16px',
                                marginBottom:
                                    '18px',
                              }}
                          >
                            <div>
                        <span className="section-kicker">
                          PREPARATION
                        </span>

                              <h3
                                  style={{
                                    margin:
                                        '5px 0 0',
                                    fontSize:
                                        '22px',
                                    letterSpacing:
                                        '-0.03em',
                                  }}
                              >
                                Order items
                              </h3>
                            </div>

                            <span
                                style={{
                                  color:
                                      '#7d877f',
                                  fontSize:
                                      '12px',
                                }}
                            >
                        {
                            selectedWaiterOrder.items
                                ?.length ||
                            0
                        }{' '}
                              items
                      </span>
                          </div>

                          <div
                              style={{
                                display:
                                    'grid',
                                gap:
                                    '14px',
                              }}
                          >
                            {(
                                selectedWaiterOrder.items ||
                                []
                            ).map(
                                (item) => {
                                  const isFood =
                                      menuItems.find(
                                          (
                                              menuItem,
                                          ) =>
                                              menuItem.id ===
                                              item.menuItemId,
                                      )?.type ===
                                      'FOOD'

                                  const preparationStep =
                                      getPreparationStep(
                                          item.preparationStatus,
                                      )

                                  return (
                                      <div
                                          key={
                                            item.id
                                          }
                                          style={{
                                            border:
                                                '1px solid #e2e8e2',
                                            borderRadius:
                                                '18px',
                                            padding:
                                                '20px',
                                            background:
                                                '#fbfcfa',
                                          }}
                                      >
                                        <div
                                            style={{
                                              display:
                                                  'flex',
                                              justifyContent:
                                                  'space-between',
                                              alignItems:
                                                  'flex-start',
                                              gap:
                                                  '18px',
                                              flexWrap:
                                                  'wrap',
                                            }}
                                        >
                                          <div
                                              style={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap:
                                                    '14px',
                                              }}
                                          >
                                            <div
                                                style={{
                                                  width:
                                                      '48px',
                                                  height:
                                                      '48px',
                                                  display:
                                                      'grid',
                                                  placeItems:
                                                      'center',
                                                  borderRadius:
                                                      '14px',
                                                  background:
                                                      isFood
                                                          ? '#f2f0e8'
                                                          : '#edf4f7',
                                                  fontSize:
                                                      '21px',
                                                }}
                                            >
                                              {isFood
                                                  ? '🍽'
                                                  : '🥤'}
                                            </div>

                                            <div>
                                              <div
                                                  style={{
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    gap:
                                                        '8px',
                                                    flexWrap:
                                                        'wrap',
                                                  }}
                                              >
                                                <strong
                                                    style={{
                                                      color:
                                                          '#263329',
                                                      fontSize:
                                                          '15px',
                                                    }}
                                                >
                                                  {
                                                    item.menuItemName
                                                  }
                                                </strong>

                                                <span
                                                    style={{
                                                      padding:
                                                          '4px 8px',
                                                      borderRadius:
                                                          '999px',
                                                      background:
                                                          isFood
                                                              ? '#f0eee5'
                                                              : '#eaf1f4',
                                                      color:
                                                          isFood
                                                              ? '#786d4d'
                                                              : '#567382',
                                                      fontSize:
                                                          '9px',
                                                      fontWeight:
                                                          800,
                                                      textTransform:
                                                          'uppercase',
                                                    }}
                                                >
                                        {isFood
                                            ? 'Food'
                                            : 'Drink'}
                                      </span>
                                              </div>

                                              <span
                                                  style={{
                                                    display:
                                                        'block',
                                                    marginTop:
                                                        '5px',
                                                    color:
                                                        '#7d877f',
                                                    fontSize:
                                                        '12px',
                                                  }}
                                              >
                                      Quantity:{' '}
                                                {
                                                  item.quantity
                                                }{' '}
                                                ·{' '}
                                                {formatCurrency(
                                                    item.unitPrice,
                                                )}{' '}
                                                each
                                    </span>
                                            </div>
                                          </div>

                                          <strong
                                              style={{
                                                color:
                                                    '#173b2b',
                                                fontSize:
                                                    '15px',
                                              }}
                                          >
                                            {formatCurrency(
                                                item.unitPrice *
                                                item.quantity,
                                            )}
                                          </strong>
                                        </div>

                                        {/* STAFF ASSIGNMENT */}
                                        <div
                                            style={{
                                              marginTop:
                                                  '20px',
                                              paddingTop:
                                                  '18px',
                                              borderTop:
                                                  '1px solid #e8ece7',
                                              display:
                                                  'grid',
                                              gridTemplateColumns:
                                                  'minmax(0, 1fr) minmax(0, 1fr)',
                                              gap:
                                                  '14px',
                                            }}
                                        >
                                          <div>
                                            <label
                                                htmlFor={`staff-${item.id}`}
                                                style={{
                                                  display:
                                                      'block',
                                                  marginBottom:
                                                      '7px',
                                                  color:
                                                      '#526057',
                                                  fontSize:
                                                      '11px',
                                                  fontWeight:
                                                      800,
                                                }}
                                            >
                                              {isFood
                                                  ? 'Chef'
                                                  : 'Bartender'}
                                            </label>

                                            <select
                                                id={`staff-${item.id}`}
                                                value={
                                                  isFood
                                                      ? item.chefId ??
                                                      ''
                                                      : item.bartenderId ??
                                                      ''
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                  const value =
                                                      Number(
                                                          event
                                                              .target
                                                              .value,
                                                      )

                                                  if (
                                                      !value
                                                  ) {
                                                    return
                                                  }

                                                  if (
                                                      isFood
                                                  ) {
                                                    assignChef(
                                                        item.id,
                                                        value,
                                                    )
                                                  } else {
                                                    assignBartender(
                                                        item.id,
                                                        value,
                                                    )
                                                  }
                                                }}
                                                disabled={
                                                    updatingItemId ===
                                                    item.id
                                                }
                                                style={{
                                                  width:
                                                      '100%',
                                                  padding:
                                                      '10px 11px',
                                                  border:
                                                      '1px solid #dce2da',
                                                  borderRadius:
                                                      '10px',
                                                  background:
                                                      '#ffffff',
                                                  color:
                                                      '#354139',
                                                  fontSize:
                                                      '12px',
                                                  outline:
                                                      'none',
                                                }}
                                            >
                                              <option value="">
                                                Select{' '}
                                                {isFood
                                                    ? 'chef'
                                                    : 'bartender'}
                                              </option>

                                              {isFood
                                                  ? chefs.map(
                                                      (
                                                          chef,
                                                      ) => (
                                                          <option
                                                              key={
                                                                chef.id
                                                              }
                                                              value={
                                                                chef.id
                                                              }
                                                          >
                                                            {
                                                              chef.name
                                                            }
                                                          </option>
                                                      ),
                                                  )
                                                  : bartenders.map(
                                                      (
                                                          bartender,
                                                      ) => (
                                                          <option
                                                              key={
                                                                bartender.id
                                                              }
                                                              value={
                                                                bartender.id
                                                              }
                                                          >
                                                            {
                                                              bartender.name
                                                            }
                                                          </option>
                                                      ),
                                                  )}
                                            </select>
                                          </div>

                                          <div>
                                  <span
                                      style={{
                                        display:
                                            'block',
                                        marginBottom:
                                            '7px',
                                        color:
                                            '#526057',
                                        fontSize:
                                            '11px',
                                        fontWeight:
                                            800,
                                      }}
                                  >
                                    Assigned staff
                                  </span>

                                            <div
                                                style={{
                                                  minHeight:
                                                      '38px',
                                                  display:
                                                      'flex',
                                                  alignItems:
                                                      'center',
                                                  padding:
                                                      '0 11px',
                                                  border:
                                                      '1px solid #e2e8e2',
                                                  borderRadius:
                                                      '10px',
                                                  background:
                                                      '#f5f8f4',
                                                  color:
                                                      '#385440',
                                                  fontSize:
                                                      '12px',
                                                  fontWeight:
                                                      700,
                                                }}
                                            >
                                              {isFood
                                                  ? item.chefName
                                                      ? `Chef ${item.chefName}`
                                                      : 'No chef assigned'
                                                  : item.bartenderName
                                                      ? `Bartender ${item.bartenderName}`
                                                      : 'No bartender assigned'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* PREPARATION STATUS */}
                                        <div
                                            style={{
                                              marginTop:
                                                  '18px',
                                            }}
                                        >
                                          <div
                                              style={{
                                                display:
                                                    'flex',
                                                justifyContent:
                                                    'space-between',
                                                alignItems:
                                                    'center',
                                                marginBottom:
                                                    '10px',
                                              }}
                                          >
                                  <span
                                      style={{
                                        color:
                                            '#526057',
                                        fontSize:
                                            '11px',
                                        fontWeight:
                                            800,
                                      }}
                                  >
                                    Preparation
                                  </span>

                                            <span
                                                style={{
                                                  color:
                                                      '#5d7565',
                                                  fontSize:
                                                      '11px',
                                                  fontWeight:
                                                      800,
                                                }}
                                            >
                                    {getPreparationLabel(
                                        item.preparationStatus,
                                    )}
                                  </span>
                                          </div>

                                          <div
                                              style={{
                                                display:
                                                    'grid',
                                                gridTemplateColumns:
                                                    'repeat(3, 1fr)',
                                                gap:
                                                    '6px',
                                                marginBottom:
                                                    '11px',
                                              }}
                                          >
                                            {[
                                              'PENDING',
                                              'PREPARING',
                                              'READY',
                                            ].map(
                                                (
                                                    status,
                                                    index,
                                                ) => (
                                                    <div
                                                        key={
                                                          status
                                                        }
                                                        style={{
                                                          height:
                                                              '5px',
                                                          borderRadius:
                                                              '999px',
                                                          background:
                                                              index +
                                                              1 <=
                                                              preparationStep
                                                                  ? '#185239'
                                                                  : '#dfe6df',
                                                        }}
                                                    />
                                                ),
                                            )}
                                          </div>

                                          <div
                                              style={{
                                                display:
                                                    'flex',
                                                gap:
                                                    '7px',
                                                flexWrap:
                                                    'wrap',
                                              }}
                                          >
                                            {[
                                              'PENDING',
                                              'PREPARING',
                                              'READY',
                                            ].map(
                                                (
                                                    status,
                                                ) => (
                                                    <button
                                                        key={
                                                          status
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            updatePreparationStatus(
                                                                item.id,
                                                                status as PreparationStatus,
                                                            )
                                                        }
                                                        disabled={
                                                            updatingItemId ===
                                                            item.id
                                                        }
                                                        style={{
                                                          border:
                                                              item.preparationStatus ===
                                                              status
                                                                  ? '1px solid #185239'
                                                                  : '1px solid #dce3dc',
                                                          background:
                                                              item.preparationStatus ===
                                                              status
                                                                  ? '#edf5ef'
                                                                  : '#ffffff',
                                                          color:
                                                              item.preparationStatus ===
                                                              status
                                                                  ? '#185239'
                                                                  : '#657169',
                                                          borderRadius:
                                                              '9px',
                                                          padding:
                                                              '7px 11px',
                                                          fontSize:
                                                              '10px',
                                                          fontWeight:
                                                              800,
                                                        }}
                                                    >
                                                      {getPreparationLabel(
                                                          status as PreparationStatus,
                                                      )}
                                                    </button>
                                                ),
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                  )
                                },
                            )}
                          </div>

                          {/* ORDER TOTAL */}
                          <div
                              style={{
                                marginTop:
                                    '24px',
                                paddingTop:
                                    '20px',
                                borderTop:
                                    '1px solid #e6ebe7',
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'center',
                              }}
                          >
                      <span
                          style={{
                            color:
                                '#69746c',
                            fontWeight:
                                700,
                            fontSize:
                                '13px',
                          }}
                      >
                        Order total
                      </span>

                            <strong
                                style={{
                                  color:
                                      '#173b2b',
                                  fontSize:
                                      '24px',
                                  letterSpacing:
                                      '-0.03em',
                                }}
                            >
                              {formatCurrency(
                                  selectedWaiterOrder.totalAmount,
                              )}
                            </strong>
                          </div>
                        </div>
                      </>
                  )}
                </div>
              </section>
            </main>
        )}
      </div>
  )
}

export default App
