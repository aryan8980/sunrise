import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProductById, incrementProductViews, listProducts } from '../services/productService';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [resolvedProductId, setResolvedProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setProduct(null);
    setResolvedProductId('');
    setImageIndex(0);

    const decodedRouteId = decodeURIComponent(productId || '').trim();
    const stateProduct = location.state?.product || null;

    const idCandidates = [
      decodedRouteId,
      stateProduct?.id,
      stateProduct?.productId,
      stateProduct?.docId
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    const resolveByCandidates = async () => {
      for (const candidate of idCandidates) {
        const found = await getProductById(candidate);
        if (found) return found;
      }
      return null;
    };

    const run = async () => {
      try {
        if (stateProduct && isActive) {
          setProduct(stateProduct);
          setResolvedProductId(String(stateProduct.id || stateProduct.productId || '').trim());
        }

        const data = await resolveByCandidates();
        if (data && isActive) {
          setProduct(data);
          setResolvedProductId(data.id);
          return;
        }

        const allProducts = await listProducts();
        const fallbackProduct = allProducts.find((item) => {
          const keys = [item.id, item.productId, item.docId, item.name].map((value) =>
            String(value || '').trim()
          );
          return keys.includes(decodedRouteId);
        });

        if (fallbackProduct && isActive) {
          setProduct(fallbackProduct);
          setResolvedProductId(String(fallbackProduct.id || '').trim());
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [productId, location.state]);

  useEffect(() => {
    if (!resolvedProductId) return;
    incrementProductViews(resolvedProductId).catch(console.error);
  }, [resolvedProductId]);

  const images = useMemo(() => product?.images || [], [product?.images]);

  if (loading) return <section className='page container'>Loading product...</section>;
  if (!product) return <section className='page container'>Product not found.</section>;

  const activeImage = images[imageIndex] || images[0];
  const canSlide = images.length > 1;
  const priceLabel = `\u20b9${Number(product.price || 0).toLocaleString('en-IN')}`;
  const whatsappText = encodeURIComponent(`Hi, I want to order ${product.name}.`);
  const whatsappLink = `https://wa.me/919881440099?text=${whatsappText}`;

  const goPrev = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section className='page container'>
      <Link className='product-detail__back' to='/'>
        Back to Home
      </Link>

      <div className='product-detail'>
        <div className='product-detail__gallery'>
          <img src={activeImage} alt={product.name} className='product-detail__main-image' loading='lazy' />
          {canSlide && (
            <>
              <button type='button' className='product-detail__nav product-detail__nav--left' onClick={goPrev}>
                &#8249;
              </button>
              <button type='button' className='product-detail__nav product-detail__nav--right' onClick={goNext}>
                &#8250;
              </button>
            </>
          )}
        </div>

        <div className='product-detail__content'>
          <span className='product-detail__chip'>{product.category || 'Category'}</span>
          <h1 className='section-title product-detail__title'>{product.name}</h1>
          <p className='product-detail__price'>{priceLabel}</p>
          <p className='product-detail__desc'>{product.description}</p>

          <a className='product-detail__cta' href={whatsappLink} target='_blank' rel='noreferrer'>
            Want to Order? Chat on WhatsApp
          </a>
          <p className='product-detail__note'>Click above to start a conversation and place your order.</p>

          <div className='product-detail__divider' />
          <ul className='product-detail__highlights'>
            <li>
              <strong>Handmade with Care</strong>
              <span>Each piece is crafted by hand with premium materials.</span>
            </li>
            <li>
              <strong>Made to Order</strong>
              <span>Orders are prepared carefully with quality-first attention.</span>
            </li>
          </ul>

          <p className={product.available ? 'status status--available' : 'status'}>
            {product.available ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailPage;
