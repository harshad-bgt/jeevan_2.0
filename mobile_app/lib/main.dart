import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';

// Initialize GoRouter
final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const Scaffold(
          body: Center(
            child: Text('Home Screen (Flutter Native)'),
          ),
        );
      },
    ),
    GoRoute(
      path: '/login',
      builder: (BuildContext context, GoRouterState state) {
        return const Scaffold(
          body: Center(
            child: Text('Login Screen'),
          ),
        );
      },
    ),
  ],
  redirect: (BuildContext context, GoRouterState state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final bool loggedIn = authProvider.user != null;
    final bool isLoggingIn = state.uri.toString() == '/login';

    if (!loggedIn && !isLoggingIn) {
      return '/login';
    }
    if (loggedIn && isLoggingIn) {
      return '/';
    }
    return null;
  },
);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    print("Firebase init failed (missing google-services.json?): $e");
  }
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const JeevanApp(),
    ),
  );
}

class JeevanApp extends StatelessWidget {
  const JeevanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Jeevan 2.0',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFEF4444), // brand-500 red
        scaffoldBackgroundColor: const Color(0xFF0F172A), // slate-900
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
