import * as React from 'react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Product } from '../types';
import { useGroup } from '../context/GroupContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart, Store, DollarSign, Tag, User, Check, ThumbsUp, ThumbsDown, Minus, Plus, X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isLowestPrice?: boolean;
}

export default function ProductCard({ product, isLowestPrice }: ProductCardProps) {
  const { currentGroup, currentMember, claimProduct, voteProduct, updateProductQuantity, deleteProduct } = useGroup();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const claimedByMember = currentGroup?.members.find(m => m.id === product.claimedBy);
  const isClaimed = !!product.claimedBy;
  const isClaimedByMe = product.claimedBy === currentMember?.id;

  // Handle votes (with defaults for backwards compatibility)
  const votes = product.votes || { thumbsUp: [], thumbsDown: [] };
  const thumbsUpCount = votes.thumbsUp.length;
  const thumbsDownCount = votes.thumbsDown.length;
  const hasMyThumbsUp = currentMember ? votes.thumbsUp.includes(currentMember.id) : false;
  const hasMyThumbsDown = currentMember ? votes.thumbsDown.includes(currentMember.id) : false;

  // Calculate approval status
  const totalVotes = thumbsUpCount + thumbsDownCount;
  const isApproved = totalVotes > 0 && thumbsUpCount > thumbsDownCount;
  const isRejected = totalVotes > 0 && thumbsDownCount > thumbsUpCount;

  // Handle quantity and unit (with defaults for backwards compatibility)
  const quantity = product.quantity || 1;
  const unit = product.unit || 'buc';
  const totalPrice = product.price * quantity;

  const handleClaim = () => {
    if (currentMember) {
      if (isClaimedByMe) {
        // Unclaim
        claimProduct(product.id, '');
      } else {
        // Claim
        claimProduct(product.id, currentMember.id);
      }
    }
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!currentMember) return;
    voteProduct(product.id, currentMember.id, voteType);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    updateProductQuantity(product.id, newQuantity);
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card 
        className={`p-4 relative transition-all ${
          isApproved ? 'ring-2 ring-green-500' : ''
        } ${
          isRejected ? 'opacity-50' : ''
        } ${
          isClaimed ? 'bg-gray-50' : ''
        } ${
          isLowestPrice && !isApproved ? 'ring-2 ring-green-400' : ''
        }`}
      >
        {/* Delete Button */}
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.photo ? (
              <ImageWithFallback
                src={product.photo}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2 mr-6">
              <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
              {isApproved && (
                <Badge className="bg-green-500 text-white flex-shrink-0">Aprobat</Badge>
              )}
              {isLowestPrice && !isApproved && (
                <Badge className="bg-green-400 text-white flex-shrink-0">Best Price</Badge>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Store className="w-4 h-4" />
                <span>{product.supermarket}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>{product.category}</span>
              </div>
              
              {/* Price Display */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    ${product.price.toFixed(2)} / {unit}
                  </span>
                </div>
                
                {/* Quantity Selector */}
                {product.quantity !== undefined && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <Button
                        onClick={() => handleQuantityChange(-1)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={isClaimed}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-semibold text-sm w-8 text-center">
                        {quantity}
                      </span>
                      <Button
                        onClick={() => handleQuantityChange(1)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={isClaimed}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">{unit}</span>
                  </div>
                )}

                {/* Total Price */}
                {product.quantity !== undefined && (
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    Total: ${totalPrice.toFixed(2)}
                    {quantity > 1 && (
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (${product.price.toFixed(2)} × {quantity})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Voting Section */}
            <div className="flex items-center gap-3 mb-3 text-sm">
              <span className="text-gray-600">Added by {product.addedByName}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleVote('up')}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 gap-1 ${hasMyThumbsUp ? 'bg-green-100 text-green-700' : ''}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">{thumbsUpCount}</span>
                </Button>
                <Button
                  onClick={() => handleVote('down')}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 gap-1 ${hasMyThumbsDown ? 'bg-red-100 text-red-700' : ''}`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span className="text-xs font-semibold">{thumbsDownCount}</span>
                </Button>
              </div>
            </div>

            {/* Claim Status */}
            {isClaimed && claimedByMember && (
              <div className="flex items-center gap-2 mb-2 text-sm">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium">
                  {isClaimedByMe ? 'You claimed this' : `Claimed by ${claimedByMember.name}`}
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleClaim}
              size="sm"
              variant={isClaimedByMe ? "default" : "outline"}
              className={`w-full ${isClaimedByMe ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              {isClaimedByMe ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Claimed
                </>
              ) : isClaimed ? (
                'Claim Instead'
              ) : (
                'Claim This Item'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sigur vrei să elimini acest produs?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va șterge produsul "{product.productName}" pentru toată lumea din grup. 
              Acțiunea nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Da, elimină
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
