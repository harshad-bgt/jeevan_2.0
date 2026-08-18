import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class GlassmorphismBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const GlassmorphismBottomNav({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 24,
      left: 24,
      right: 24,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            height: 65,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(0, LucideIcons.home, "Home"),
                _buildNavItem(1, LucideIcons.map, "Hub"),
                _buildNavItem(2, LucideIcons.droplets, "Request", isPrimary: true),
                _buildNavItem(3, LucideIcons.user, "Profile"),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isPrimary = false}) {
    final isSelected = currentIndex == index;
    
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 60,
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isPrimary 
                  ? const Color(0xFFEF4444) // brand red
                  : (isSelected ? Colors.white : Colors.white54),
              size: isPrimary ? 28 : 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isPrimary
                    ? const Color(0xFFEF4444)
                    : (isSelected ? Colors.white : Colors.white54),
                fontSize: 10,
                fontWeight: isSelected || isPrimary ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
